interface Layer {
  type: string;
  id: Number;
  label: string;
  opacity: number;
  tileURL: string;
  visible: boolean;
}

interface LayerCompute extends Layer {
  layerVars: LayerVar[];
  colorScale: string;
  stretchedRange: LayerRange;
}

interface LayerVar {
  type: string;
  id: Number;
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
