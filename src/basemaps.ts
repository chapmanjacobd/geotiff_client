export interface Basemap {
  label: string;
  url: string;
  attribution: string;
}

export const BASEMAPS: Basemap[] = [
  {
    label: "OpenStreetMap",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
  },
  {
    label: "Google Satellite",
    url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    attribution: "© Google",
  },
  {
    label: "Google Hybrid",
    url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    attribution: "© Google",
  },
];

export const DEFAULT_BASEMAP = BASEMAPS[0];
