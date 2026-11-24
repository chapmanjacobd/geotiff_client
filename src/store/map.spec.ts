import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { computeQueryParams, useMapStore } from "./map";
import type { LayerCompute } from "./map";
import { LAYER_VARS } from "../data";

const makeComputeLayer = (
  overrides: Partial<LayerCompute> = {}
): LayerCompute => ({
  type: "l-compute",
  id: "layer-1",
  opacity: 0.8,
  visible: true,
  tileURL: "",
  colorScale: "accent_r",
  stretchedRange: { min: 0, max: 10 },
  layerVars: [
    {
      type: "l-compute-variable",
      id: "var-1",
      file: "dataset-a",
      actualRange: { min: 0, max: 10 },
      filteredRange: { min: 0, max: 10 },
      visible: true,
    },
  ],
  ...overrides,
});

const parseTileUrl = (tileURL: string): URL =>
  new URL(tileURL.replace("{z}/{x}/{y}", "0/0/0"));

describe("computeQueryParams", () => {
  it("builds a single variable expression", () => {
    const layer = makeComputeLayer();

    computeQueryParams(layer);

    const url = parseTileUrl(layer.tileURL);
    expect(url.pathname).toBe("/compute/0/0/0.png");
    expect(url.searchParams.get("colormap")).toBe("accent_r");
    expect(url.searchParams.get("expression")).toBe("v1");
    expect(url.searchParams.get("v1")).toBe("dataset-a");
    expect(url.searchParams.get("stretch_range")).toBe(
      '["0.000000","10.000000"]'
    );
  });

  it("builds a mask expression from multiple visible variables", () => {
    const layer = makeComputeLayer({
      layerVars: [
        {
          type: "l-compute-variable",
          id: "var-1",
          file: "dataset-a",
          actualRange: { min: 0, max: 10 },
          filteredRange: { min: 0, max: 10 },
          visible: true,
        },
        {
          type: "l-compute-variable",
          id: "var-2",
          file: "dataset-b",
          actualRange: { min: 0, max: 20 },
          filteredRange: { min: 2, max: 18 },
          visible: true,
        },
      ],
    });

    computeQueryParams(layer);

    const url = parseTileUrl(layer.tileURL);
    expect(url.searchParams.get("expression")).toBe(
      "setmask(v1, getmask(masked_outside(v1, 0.000000, 10.000000)) | getmask(masked_outside(v2, 2.000000, 18.000000)))"
    );
    expect(url.searchParams.get("v1")).toBe("dataset-a");
    expect(url.searchParams.get("v2")).toBe("dataset-b");
  });

  it("includes path keys before the tile coordinates", () => {
    const layer = makeComputeLayer();

    computeQueryParams(layer, "group");

    const url = parseTileUrl(layer.tileURL);
    expect(url.pathname).toBe("/compute/group/0/0/0.png");
  });
});

describe("map store", () => {
  let map: ReturnType<typeof useMapStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    map = useMapStore();
  });

  it("starts empty in single split mode", () => {
    expect(map.layersCount).toBe(0);
    expect(map.splitMode).toBe("single");
  });

  it("adds a compute layer with a tile URL and a random variable", () => {
    map.addLayer("l-compute");

    expect(map.layersCount).toBe(1);
    const layer = map.layers[0] as LayerCompute;
    expect(layer.type).toBe("l-compute");
    expect(layer.colorScale).toBe("accent_r");
    expect(layer.layerVars).toHaveLength(1);
    expect(layer.stretchedRange).toEqual(layer.layerVars[0].actualRange);
    expect(parseTileUrl(layer.tileURL).pathname).toBe("/compute/0/0/0.png");
    expect(LAYER_VARS.map((lv) => lv.file)).toContain(layer.layerVars[0].file);
  });

  it("adds a basemap layer", () => {
    map.addLayer("l-basemap");

    expect(map.layersCount).toBe(1);
    expect(map.layers[0]).toMatchObject({
      type: "l-basemap",
      visible: true,
      opacity: 0.8,
    });
  });

  it("removes a layer and bumps the revision", () => {
    map.addLayer("l-basemap");
    const layerId = map.layers[0].id;
    const revision = map.revision;

    map.removeLayer(layerId);

    expect(map.layersCount).toBe(0);
    expect(map.revision).toBe(revision + 1);
  });

  it("moves layers up and down", () => {
    map.addLayer("l-basemap");
    map.addLayer("l-basemap");
    const [first, second] = map.layers.map((layer) => layer.id);

    map.moveLayerUp(first);
    expect(map.layers.map((layer) => layer.id)).toEqual([second, first]);

    map.moveLayerDown(first);
    expect(map.layers.map((layer) => layer.id)).toEqual([first, second]);
  });

  it("adds and removes compute variables", () => {
    map.addLayer("l-compute");
    const layerId = map.layers[0].id;

    map.addLayerVar(layerId);
    expect((map.layers[0] as LayerCompute).layerVars).toHaveLength(2);

    const [firstVar, secondVar] = (map.layers[0] as LayerCompute).layerVars;
    map.removeLayerVar(layerId, firstVar.id);
    expect((map.layers[0] as LayerCompute).layerVars).toHaveLength(1);

    map.removeLayerVar(layerId, secondVar.id);
    expect(map.layersCount).toBe(0);
  });

  it("updates a variable from the layer variable catalog", () => {
    map.addLayer("l-compute");
    const layer = map.layers[0] as LayerCompute;
    const layerVar = layer.layerVars[0];
    const nextFile = LAYER_VARS.find((lv) => lv.file !== layerVar.file)!.file;
    layerVar.file = nextFile;

    map.updateLayerVar(layer.id, layerVar.id);

    expect(layerVar.file).toBe(nextFile);
    expect(layerVar.actualRange).toEqual({
      min: LAYER_VARS.find((lv) => lv.file === nextFile)!.min,
      max: LAYER_VARS.find((lv) => lv.file === nextFile)!.max,
    });
  });

  it("toggles layer visibility", () => {
    map.addLayer("l-basemap");
    const layer = map.layers[0];

    map.toggleLayerVisibility(layer.id);
    expect(layer.visible).toBe(false);

    map.toggleLayerVisibility(layer.id);
    expect(layer.visible).toBe(true);
  });
});
