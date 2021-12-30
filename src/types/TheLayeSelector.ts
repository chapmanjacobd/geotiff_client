interface Layer {
  type: string;
  id: number;
  label: string;
  opacity: number;
  URL: string;
}

interface LayerVar {
  type: string;
  id: number;
  dataset?: string;
}

interface Dataset {
  file: string;
}
