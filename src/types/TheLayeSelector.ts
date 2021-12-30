interface Layer {
  type: string;
  id: number;
  label: string;
  opacity: number;
  tileURL: string;
}

interface LayerCompute extends Layer {
  layerVars: LayerVar[];
  layerVarsExpression: string;
  colorScale: string;
  stretchedRange: Range;
}

interface LayerVar {
  type: string;
  id: number;
  dataset: string;
  actualRange: Range;
  filteredRange: Range;
}

interface Range {
  min: number;
  max: number;
}
