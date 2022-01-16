import { defineStore } from "pinia";
import { API } from "../config";
import { COLORSCALES, LAYER_VARS } from "../data";
import { v4 as uuidv4 } from "uuid";

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

const computeQueryParams = (layer: LayerCompute, someKeys = "") => {
  if (layer.layerVars.length === 1) console.log("only one compute var");
  if (layer.layerVars.length > 5) console.log("probably more vars than terracotta wants");

  const expr_proto = layer.layerVars
    .map((v, i) => {
      if (typeof v === typeof undefined) return;
      if (!v.visible) return;
      return `getmask(masked_outside(v${i + 1}, ${v.filteredRange.min}, ${v.filteredRange.max}))`;
    })
    .filter(Boolean);
  const expr = layer.layerVars.length === 1 ? "v1" : `setmask(v1, ${expr_proto.join(" | ")})`;

  const operandKeys = layer.layerVars.reduce((obj, v, i) => {
    if (typeof v === typeof undefined) return obj;
    if (!v.visible) return obj;
    const key = "v" + (i + 1);
    return { ...obj, [key]: v.file };
  }, {});

  return computeUrl(someKeys, {
    colormap: layer.colorScale,
    stretch_range: JSON.stringify([layer.stretchedRange.min, layer.stretchedRange.max]),
    expression: expr,
    ...operandKeys,
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
  return {
    id: uuidv4(),
    tileURL: "",
    opacity: 0.8,
    visible: true,
  };
}

function newLayerVar() {
  return {
    ...getRandomLayerVar(),
    id: uuidv4(),
  };
}

type LayerType = "l-basemap" | "l-compute";

function getRandomLayerVar() {
  return LAYER_VARS[Math.floor(Math.random() * LAYER_VARS.length)];
}

const moveLayerVarTo = (index) => {
  if (index < 0) return;
  if (index >= layerVars.length - 1) return;

  array_move(layerVars, props.layerVarId, index);
};
const deleteLayerVar = (layerVarId) => {
  layerVars.splice(layerVarId, 1);
};

const toggleVisibility = (layerVarId) => {
  const visible = layerVars[layerVarId].visible;
  layerVars[layerVarId].visible = !visible;
};

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
      return this.layers[i];
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
          colorScale: COLORSCALES[Math.floor(Math.random() * COLORSCALES.length)],
          layerVars: [randomLayerVarOpt],
        };
        this.layers.push(defaultLayerCompute);
      }
    },
    removeLayer(layerId) {
      const i = this.layers.findIndex((s) => s.id === layerId);
      if (i > -1) this.layers.splice(i, 1);
    },
    moveLayerUp(layerId) {
      const i = this.layers.findIndex((s) => s.id === layerId);
      // if (index < 0) return
      // if (index >= map.layers.length - 1) return
      array_move(this.layers, i, i + 1);
    },
    moveLayerDown(layerId) {
      const i = this.layers.findIndex((s) => s.id === layerId);
      // if (index < 0) return
      // if (index >= map.layers.length - 1) return
      array_move(this.layers, i, i - 1);
    },
    addLayerVar(layer: LayerCompute) {
      layer.layerVars.push(newLayerVar());
    },
    removeLayerVar(layer: LayerCompute, layerVar: LayerVar) {
      const i = layer.layerVars.findIndex((s) => s.id === layerVar.id);
      if (i > -1) this.layers.splice(i, 1);
    },
    toggleLayerVisibility(layerId) {
      const i = this.layers.findIndex((s) => s.id === layerId);
      const visible = this.layers[i].visible;
      this.layers[i].visible = !visible;
    },
    toggleLayerVarVisibility(layerId, layerVarId) {
      const i = this.layers.findIndex((s) => s.id === layerId);
      const visible = this.layers[i].visible;
      this.layers[i].visible = !visible;
    },
  },
});
