import { defineStore } from "pinia";
import { v4 as uuidv4 } from "uuid";
import { API } from "../config";
import { BASEMAPS, DEFAULT_BASEMAP } from "../basemaps";
import {
  fetchMetadata,
  loadServerConfig,
  type ServerDataset,
} from "../api";
import {
  clampFilterMax,
  clampFilterMin,
  clampStretchMax,
  clampStretchMin,
  initialStretch,
  type LayerRange,
} from "../ranges";

export const MAX_LAYER_VARS = 5;

export interface LayerVar {
  type: "l-compute-variable";
  id: string;
  datasetId: string;
  file: string;
  label: string;
  keys: string[];
  someKeys: string;
  actualRange: LayerRange;
  filteredRange: LayerRange;
  visible: boolean;
  loading: boolean;
  error: string | null;
}

interface LayerBase {
  id: string;
  opacity: number;
  tileURL: string;
  visible: boolean;
  attribution?: string;
}

export interface LayerBasemap extends LayerBase {
  type: "l-basemap";
  attribution: string;
}

export interface LayerCompute extends LayerBase {
  type: "l-compute";
  layerVars: LayerVar[];
  outputVarId: string;
  colorScale: string;
  stretchedRange: LayerRange;
}

export type Layer = LayerBasemap | LayerCompute;
export type LayerType = Layer["type"];

const PLACEHOLDER_RANGE: LayerRange = { min: 0, max: 1 };

function formatCoordinate(value: number): string {
  return value.toFixed(6);
}

export function getOutputVar(layer: LayerCompute): LayerVar | undefined {
  return (
    layer.layerVars.find((layerVar) => layerVar.id === layer.outputVarId) ??
    layer.layerVars[0]
  );
}

export function buildComputeUrl(
  layer: LayerCompute,
  tileSize: [number, number]
): string {
  const output = getOutputVar(layer);
  if (!output || output.loading || output.error) return "";

  const masks = layer.layerVars
    .filter(
      (layerVar) =>
        layerVar !== output &&
        layerVar.visible &&
        !layerVar.loading &&
        !layerVar.error &&
        layerVar.someKeys === output.someKeys
    )
    // Keep the URL stable when the UI list is reordered.
    .sort((a, b) => a.id.localeCompare(b.id));

  const operands = [output, ...masks].slice(0, MAX_LAYER_VARS);
  const maskExpressions = operands.map(
    (layerVar, index) =>
      `getmask(masked_outside(v${index + 1}, ${formatCoordinate(
        layerVar.filteredRange.min
      )}, ${formatCoordinate(layerVar.filteredRange.max)}))`
  );

  const expression = `setmask(v1, ${maskExpressions.join(" | ")})`;
  const params = new URLSearchParams({
    colormap: layer.colorScale,
    expression,
    stretch_range: JSON.stringify([
      layer.stretchedRange.min,
      layer.stretchedRange.max,
    ]),
    tile_size: JSON.stringify([tileSize[0], tileSize[1]]),
  });

  for (const [index, layerVar] of operands.entries()) {
    params.set(`v${index + 1}`, layerVar.file);
  }

  const keyPath = output.someKeys ? `${output.someKeys}/` : "";
  return `${API}/compute/${keyPath}{z}/{x}/{y}.png?${params.toString()}`;
}

const refreshTimers = new Map<string, ReturnType<typeof setTimeout>>();
const hydrationTokens = new Map<string, number>();

export const useMapStore = defineStore("map", {
  state: () => ({
    layers: [] as Layer[],
    splitMode: "single" as "single" | "horizontal" | "vertical",
    datasets: [] as ServerDataset[],
    catalogLoading: false,
    catalogError: null as string | null,
    tileSize: [256, 256] as [number, number],
    initialized: false,
  }),
  getters: {
    layersCount(state): number {
      return state.layers.length;
    },
    hasDatasets(state): boolean {
      return state.datasets.length > 0;
    },
  },
  actions: {
    async initialize() {
      if (this.initialized) return;
      this.initialized = true;
      if (this.layers.length === 0) this.addBasemap();
      await this.reloadCatalog();
    },
    async reloadCatalog() {
      this.catalogLoading = true;
      this.catalogError = null;
      try {
        const { datasets, tileSize } = await loadServerConfig();
        this.datasets = datasets;
        this.tileSize = tileSize;
        this.refreshAllComputeLayers();
      } catch (error) {
        this.catalogError =
          error instanceof Error ? error.message : String(error);
      } finally {
        this.catalogLoading = false;
      }
    },
    setSplitMode(mode: "single" | "horizontal" | "vertical") {
      this.splitMode = mode;
    },
    layerById(layerId: string): Layer | undefined {
      return this.layers.find((layer) => layer.id === layerId);
    },
    computeLayerById(layerId: string): LayerCompute | undefined {
      const layer = this.layerById(layerId);
      return layer?.type === "l-compute" ? layer : undefined;
    },
    basemapById(layerId: string): LayerBasemap | undefined {
      const layer = this.layerById(layerId);
      return layer?.type === "l-basemap" ? layer : undefined;
    },
    layerVarById(layerId: string, layerVarId: string): LayerVar | undefined {
      return this.computeLayerById(layerId)?.layerVars.find(
        (layerVar) => layerVar.id === layerVarId
      );
    },
    addBasemap() {
      const layer: LayerBasemap = {
        type: "l-basemap",
        id: uuidv4(),
        tileURL: DEFAULT_BASEMAP.url,
        attribution: DEFAULT_BASEMAP.attribution,
        opacity: 0.8,
        visible: true,
      };
      this.layers.push(layer);
      return layer;
    },
    setBasemap(layerId: string, url: string) {
      const layer = this.basemapById(layerId);
      const basemap = BASEMAPS.find((item) => item.url === url);
      if (!layer || !basemap) return;
      layer.tileURL = basemap.url;
      layer.attribution = basemap.attribution;
    },
    async addLayer(type: LayerType) {
      if (type === "l-basemap") return this.addBasemap();
      return this.addComputeLayer();
    },
    randomDataset(someKeys?: string): ServerDataset | undefined {
      const datasets =
        someKeys === undefined
          ? this.datasets
          : this.datasets.filter((dataset) => dataset.someKeys === someKeys);
      if (datasets.length === 0) return undefined;
      return datasets[Math.floor(Math.random() * datasets.length)];
    },
    createLayerVar(dataset: ServerDataset): LayerVar {
      return {
        type: "l-compute-variable",
        id: uuidv4(),
        datasetId: dataset.datasetId,
        file: dataset.file,
        label: dataset.label,
        keys: [...dataset.keys],
        someKeys: dataset.someKeys,
        actualRange: { ...PLACEHOLDER_RANGE },
        filteredRange: { ...PLACEHOLDER_RANGE },
        visible: true,
        loading: true,
        error: null,
      };
    },
    async addComputeLayer(): Promise<LayerCompute | undefined> {
      const dataset = this.randomDataset();
      if (!dataset) return undefined;

      const layerVar = this.createLayerVar(dataset);
      const layer: LayerCompute = {
        type: "l-compute",
        id: uuidv4(),
        tileURL: "",
        opacity: 0.8,
        visible: true,
        colorScale: "accent_r",
        stretchedRange: { ...PLACEHOLDER_RANGE },
        outputVarId: layerVar.id,
        layerVars: [layerVar],
      };

      this.layers.push(layer);
      await this.hydrateLayerVar(layer.id, layerVar.id);
      return layer;
    },
    layerVarExists(layerId: string, layerVarId: string): boolean {
      return Boolean(this.layerVarById(layerId, layerVarId));
    },
    async hydrateLayerVar(layerId: string, layerVarId: string) {
      const layer = this.computeLayerById(layerId);
      const layerVar = this.layerVarById(layerId, layerVarId);
      if (!layer || !layerVar) return;

      const token = (hydrationTokens.get(layerVarId) ?? 0) + 1;
      hydrationTokens.set(layerVarId, token);
      const isCurrent = () =>
        hydrationTokens.get(layerVarId) === token &&
        this.layerVarExists(layerId, layerVarId);

      layerVar.loading = true;
      layerVar.error = null;

      try {
        const metadata = await fetchMetadata(layerVar);
        if (!isCurrent()) return;

        layerVar.actualRange = {
          min: metadata.range[0],
          max: metadata.range[1],
        };
        layerVar.filteredRange = { ...layerVar.actualRange };

        if (getOutputVar(layer)?.id === layerVarId) {
          layer.stretchedRange = initialStretch(layerVar.actualRange);
        }
      } catch (error) {
        if (!isCurrent()) return;
        layerVar.error =
          error instanceof Error ? error.message : String(error);
      } finally {
        if (isCurrent()) {
          layerVar.loading = false;
          this.refreshComputeLayerTileURL(layerId);
        }
      }
    },
    async setLayerVarDataset(
      layerId: string,
      layerVarId: string,
      datasetId: string
    ) {
      const layer = this.computeLayerById(layerId);
      const layerVar = this.layerVarById(layerId, layerVarId);
      const dataset = this.datasets.find(
        (item) => item.datasetId === datasetId
      );
      if (!layer || !layerVar || !dataset) return;

      const output = getOutputVar(layer);
      if (layerVar !== output && output && dataset.someKeys !== output.someKeys) {
        return;
      }

      const outputChangesGroup =
        layerVar === output &&
        output !== undefined &&
        dataset.someKeys !== output.someKeys;

      layerVar.datasetId = dataset.datasetId;
      layerVar.file = dataset.file;
      layerVar.label = dataset.label;
      layerVar.keys = [...dataset.keys];
      layerVar.someKeys = dataset.someKeys;

      if (outputChangesGroup) {
        layer.layerVars = layer.layerVars.filter(
          (item) => item === layerVar || item.someKeys === dataset.someKeys
        );
      }

      await this.hydrateLayerVar(layerId, layerVarId);
    },
    setColorScale(layerId: string, colorScale: string) {
      const layer = this.computeLayerById(layerId);
      if (!layer) return;
      layer.colorScale = colorScale;
      this.refreshComputeLayerTileURL(layerId);
    },
    setFilteredMin(layerId: string, layerVarId: string, value: number) {
      const layerVar = this.layerVarById(layerId, layerVarId);
      if (!layerVar) return;
      layerVar.filteredRange = clampFilterMin(
        layerVar.filteredRange,
        layerVar.actualRange,
        value
      );
      this.scheduleRefresh(layerId);
    },
    setFilteredMax(layerId: string, layerVarId: string, value: number) {
      const layerVar = this.layerVarById(layerId, layerVarId);
      if (!layerVar) return;
      layerVar.filteredRange = clampFilterMax(
        layerVar.filteredRange,
        layerVar.actualRange,
        value
      );
      this.scheduleRefresh(layerId);
    },
    setStretchMin(layerId: string, value: number) {
      const layer = this.computeLayerById(layerId);
      const output = layer ? getOutputVar(layer) : undefined;
      if (!layer || !output) return;
      layer.stretchedRange = clampStretchMin(
        layer.stretchedRange,
        output.actualRange,
        value
      );
      this.scheduleRefresh(layerId);
    },
    setStretchMax(layerId: string, value: number) {
      const layer = this.computeLayerById(layerId);
      const output = layer ? getOutputVar(layer) : undefined;
      if (!layer || !output) return;
      layer.stretchedRange = clampStretchMax(
        layer.stretchedRange,
        output.actualRange,
        value
      );
      this.scheduleRefresh(layerId);
    },
    setLayerVarVisibility(
      layerId: string,
      layerVarId: string,
      visible: boolean
    ) {
      const layer = this.computeLayerById(layerId);
      const layerVar = this.layerVarById(layerId, layerVarId);
      if (!layer || !layerVar) return;

      const isOutput = getOutputVar(layer)?.id === layerVarId;
      layerVar.visible = isOutput ? true : visible;
      this.scheduleRefresh(layerId);
    },
    setOutputVar(layerId: string, layerVarId: string) {
      const layer = this.computeLayerById(layerId);
      const layerVar = this.layerVarById(layerId, layerVarId);
      if (!layer || !layerVar) return;
      if (layer.outputVarId === layerVarId) return;

      layer.outputVarId = layerVarId;
      this.syncOutput(layer);
      this.refreshComputeLayerTileURL(layerId);
    },
    async addLayerVar(layerId: string) {
      const layer = this.computeLayerById(layerId);
      const output = layer ? getOutputVar(layer) : undefined;
      if (!layer || !output) return;
      if (layer.layerVars.length >= MAX_LAYER_VARS) return;

      const dataset = this.randomDataset(output.someKeys);
      if (!dataset) return;

      const layerVar = this.createLayerVar(dataset);
      layer.layerVars.push(layerVar);
      await this.hydrateLayerVar(layerId, layerVar.id);
    },
    removeLayerVar(layerId: string, layerVarId: string) {
      const layer = this.computeLayerById(layerId);
      if (!layer) return;

      const index = layer.layerVars.findIndex(
        (layerVar) => layerVar.id === layerVarId
      );
      if (index < 0) return;

      const removedOutput = getOutputVar(layer)?.id === layerVarId;
      layer.layerVars.splice(index, 1);
      if (layer.layerVars.length === 0) {
        this.removeLayer(layerId);
        return;
      }

      if (removedOutput) {
        layer.outputVarId = layer.layerVars[0].id;
        this.syncOutput(layer);
      } else if (!layer.layerVars.some((item) => item.id === layer.outputVarId)) {
        layer.outputVarId = layer.layerVars[0].id;
        this.syncOutput(layer);
      }
      this.refreshComputeLayerTileURL(layerId);
    },
    syncOutput(layer: LayerCompute) {
      const output = getOutputVar(layer);
      if (!output) return;
      output.visible = true;
      layer.stretchedRange =
        output.loading || output.error
          ? { ...PLACEHOLDER_RANGE }
          : initialStretch(output.actualRange);
    },
    canMoveLayerVarUp(layerId: string, layerVarId: string): boolean {
      const layer = this.computeLayerById(layerId);
      if (!layer) return false;
      return layer.layerVars.findIndex((item) => item.id === layerVarId) > 0;
    },
    canMoveLayerVarDown(layerId: string, layerVarId: string): boolean {
      const layer = this.computeLayerById(layerId);
      if (!layer) return false;
      const index = layer.layerVars.findIndex(
        (item) => item.id === layerVarId
      );
      return index >= 0 && index < layer.layerVars.length - 1;
    },
    moveLayerVar(layerId: string, layerVarId: string, delta: number) {
      const layer = this.computeLayerById(layerId);
      if (!layer) return;

      const index = layer.layerVars.findIndex(
        (layerVar) => layerVar.id === layerVarId
      );
      const target = index + delta;
      if (index < 0 || target < 0 || target >= layer.layerVars.length) return;

      const [moved] = layer.layerVars.splice(index, 1);
      layer.layerVars.splice(target, 0, moved);
      this.refreshComputeLayerTileURL(layerId);
    },
    moveLayerVarUp(layerId: string, layerVarId: string) {
      this.moveLayerVar(layerId, layerVarId, -1);
    },
    moveLayerVarDown(layerId: string, layerVarId: string) {
      this.moveLayerVar(layerId, layerVarId, 1);
    },
    canMoveLayerForward(layerId: string): boolean {
      const index = this.layers.findIndex((layer) => layer.id === layerId);
      return index >= 0 && index < this.layers.length - 1;
    },
    canMoveLayerBackward(layerId: string): boolean {
      return this.layers.findIndex((layer) => layer.id === layerId) > 0;
    },
    moveLayer(layerId: string, delta: number) {
      const index = this.layers.findIndex((layer) => layer.id === layerId);
      const target = index + delta;
      if (index < 0 || target < 0 || target >= this.layers.length) return;
      const [moved] = this.layers.splice(index, 1);
      this.layers.splice(target, 0, moved);
    },
    moveLayerForward(layerId: string) {
      this.moveLayer(layerId, 1);
    },
    moveLayerBackward(layerId: string) {
      this.moveLayer(layerId, -1);
    },
    removeLayer(layerId: string) {
      const timer = refreshTimers.get(layerId);
      if (timer) {
        clearTimeout(timer);
        refreshTimers.delete(layerId);
      }
      const index = this.layers.findIndex((layer) => layer.id === layerId);
      if (index >= 0) this.layers.splice(index, 1);
    },
    refreshComputeLayerTileURL(layerId: string) {
      const layer = this.computeLayerById(layerId);
      if (!layer) return;
      layer.tileURL = buildComputeUrl(layer, this.tileSize);
    },
    refreshAllComputeLayers() {
      for (const layer of this.layers) {
        if (layer.type === "l-compute") {
          layer.tileURL = buildComputeUrl(layer, this.tileSize);
        }
      }
    },
    scheduleRefresh(layerId: string) {
      const existing = refreshTimers.get(layerId);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(() => {
        refreshTimers.delete(layerId);
        this.refreshComputeLayerTileURL(layerId);
      }, 120);
      refreshTimers.set(layerId, timer);
    },
  },
});
