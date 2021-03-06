import { defineStore } from "pinia";
import { API } from "../config";
import { COLORSCALES, LAYER_VARS } from "../data";
import { v4 as uuidv4 } from "uuid";
import { computed, reactive } from "vue";

interface Layer {
  type: string;
  id: string;
  opacity: number;
  tileURL: string;
  visible: boolean;
}

export interface LayerCompute extends Layer {
  layerVars: LayerVar[];
  colorScale: string;
  stretchedRange: LayerRange;
}

interface LayerVar {
  type: string;
  id: string;
  file: string;
  actualRange: LayerRange;
  filteredRange: LayerRange;
  percentiles100?: number[];
  visible: boolean;
}

interface LayerRange {
  min: number;
  max: number;
}

function array_move(arr, old_index, new_index) {
  while (old_index < 0) {
    old_index += arr.length;
  }
  while (new_index < 0) {
    new_index += arr.length;
  }
  if (new_index >= arr.length) {
    var k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr; // for testing purposes
}

const computeUrl = (someKeys, queryParams = {}) => {
  const queryString = new URLSearchParams(queryParams).toString();

  return `${API}/compute/${someKeys}/{z}/{x}/{y}.png?${queryString}`;
};

export const computeQueryParams = (layer: LayerCompute, someKeys = "") => {
  if (layer.layerVars.length === 1) console.log("only one compute var");
  if (layer.layerVars.length > 5) console.log("probably more vars than terracotta wants");

  const expr_proto = layer.layerVars
    .map((v, i) => {
      if (typeof v === typeof undefined) return;
      if (!v.visible) return;
      return `getmask(masked_outside(v${i + 1}, ${v.filteredRange.min.toFixed(
        6
      )}, ${v.filteredRange.max.toFixed(6)}))`;
    })
    .filter(Boolean);
  const expr = layer.layerVars.length === 1 ? "v1" : `setmask(v1, ${expr_proto.join(" | ")})`;

  const operandKeys = layer.layerVars.reduce((obj, v, i) => {
    if (typeof v === typeof undefined) return obj;
    if (!v.visible) return obj;
    const key = "v" + (i + 1);
    return { ...obj, [key]: v.file };
  }, {});

  layer.tileURL = computeUrl(someKeys, {
    colormap: layer.colorScale,
    expression: expr,
    ...operandKeys,
    stretch_range: JSON.stringify([
      layer.stretchedRange.min.toFixed(6),
      layer.stretchedRange.max.toFixed(6),
    ]),
  });
};

const fetchRange = async (dataset) => {
  fetch(`${API}/metadata/${dataset}`).then((r) => {
    r.json().then((j) => {
      console.log(j);
      return j["range"];
    });
  });
};

function newLayer() {
  return reactive({
    id: uuidv4(),
    tileURL: "",
    opacity: 0.8,
    visible: true,
  });
}

function newLayerVar() {
  return reactive({
    ...getRandomLayerVar(),
    id: uuidv4(),
  });
}

type LayerType = "l-basemap" | "l-compute";

function getRandomLayerVar() {
  return LAYER_VARS[Math.floor(Math.random() * LAYER_VARS.length)];
}

export const useMapStore = defineStore({
  id: "map",
  state: () => ({
    layers: [] as Layer[],
  }),
  getters: {
    layersCount() {
      return this.layers.length;
    },
  },
  actions: {
    layerById(layerId) {
      const i = this.layers.findIndex((s) => s.id === layerId);
      return reactive(this.layers[i]) as Layer;
    },
    layerVarById(layerId, layerVarId) {
      const i = this.layers.findIndex((s) => s.id === layerId);
      const lvi = this.layers[i].layerVars.findIndex((s) => s.id === layerVarId);
      return reactive(this.layers[i].layerVars[lvi]) as LayerVar;
    },
    addLayer(type: LayerType) {
      if (type == "l-basemap") {
        this.layers.push({ ...newLayer(), type: "l-basemap" });
      }
      if (type == "l-compute") {
        const randomLayerVarOpt = newLayerVar();
        const defaultLayerCompute: LayerCompute = {
          ...newLayer(),
          type: "l-compute",
          stretchedRange: { min: randomLayerVarOpt.min, max: randomLayerVarOpt.max },
          // colorScale: COLORSCALES[Math.floor(Math.random() * COLORSCALES.length)],
          colorScale: "accent_r",
          layerVars: [randomLayerVarOpt],
        };
        this.layers.push(defaultLayerCompute);
      }
    },
    removeLayer(layerId) {
      const i = this.layers.findIndex((s) => s.id === layerId);
      if (i > -1) this.layers.splice(i, 1);
    },
    canMoveLayerUp(layerId) {
      const i = this.layers.findIndex((s) => s.id === layerId);
      const ti = i - 1;
      if (ti < 0) return false;
      if (ti >= this.layers.length) return false;
      return true;
    },
    canMoveLayerDown(layerId) {
      const i = this.layers.findIndex((s) => s.id === layerId);
      const ti = i + 1;
      if (ti <= 0) return false;
      if (ti >= this.layers.length) return false;
      return true;
    },
    moveLayerUp(layerId) {
      const i = this.layers.findIndex((s) => s.id === layerId);
      array_move(this.layers, i, i - 1);
    },
    moveLayerDown(layerId) {
      const i = this.layers.findIndex((s) => s.id === layerId);
      array_move(this.layers, i, i + 1);
    },
    toggleLayerVisibility(layerId) {
      const i = this.layers.findIndex((s) => s.id === layerId);
      const visible = this.layers[i].visible;
      this.layers[i].visible = !visible;
    },
    addLayerVar(layerId) {
      const layer = this.layerById(layerId);
      layer.layerVars.push(newLayerVar());
    },
    removeLayerVar(layerId, layerVarId) {
      const layer = this.layerById(layerId) as LayerCompute;
      const i = layer.layerVars.findIndex((s) => s.id === layerVarId);
      if (i > -1) layer.layerVars.splice(i, 1);
      if (layer.layerVars.length === 0) this.removeLayer(layerId);
    },
    moveLayerVarUp(layerId, layerVarId) {
      const layer = this.layerById(layerId);
      const i = layer.layerVars.findIndex((s) => s.id === layerVarId);
      // if (index < 0) return
      // if (index >= map.layers.length - 1) return
      array_move(layer.layerVars, i, i + 1);
    },
    moveLayerVarDown(layerId, layerVarId) {
      const layer = this.layerById(layerId);
      const i = layer.layerVars.findIndex((s) => s.id === layerVarId);
      // if (index < 0) return
      // if (index >= map.layers.length - 1) return
      array_move(layer.layerVars, i, i - 1);
    },
    toggleLayerVarVisibility(layerId, layerVarId) {
      const layer = this.layerById(layerId);
      const i = layer.layerVars.findIndex((s) => s.id === layerVarId);
      const visible = layer.layerVars[i].visible;
      layer.layerVars[i].visible = !visible;
    },
    updateLayerVar(layerId, layerVarId) {
      const layer = this.layerById(layerId);
      const i = layer.layerVars.findIndex((s) => s.id === layerVarId);
      let layerVar = layer.layerVars[i];
      const file = layerVar.file;
      layerVar = LAYER_VARS.find((lv) => lv.file === file)[0];
    },
  },
});
