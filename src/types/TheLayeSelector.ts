interface Layer {
  type: string;
  id: Number;
  label: string;
  opacity: number;
  tileURL: string;
}

interface LayerCompute extends Layer {
  layerVars: LayerVar[];
  layerVarsExpression: string;
  colorScale: string;
  stretchedRange: LayerRange;
}

interface LayerVar {
  type: string;
  id: Number;
  dataset: string;
  actualRange: LayerRange;
  filteredRange: LayerRange;
  percentiles100?: number[];
}

interface LayerRange {
  min: number;
  max: number;
}
