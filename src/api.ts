import { API } from "./config";

export interface ServerDataset {
  keys: string[];
  datasetId: string;
  label: string;
  file: string;
  someKeys: string;
}

export interface ServerMetadata {
  range: [number, number];
  percentiles?: number[];
}

interface KeysResponse {
  keys: { key: string; description?: string }[];
}

interface DatasetsResponse {
  datasets: Record<string, string>[];
  limit: number;
  page: number;
}

const DATASET_PAGE_SIZE = 500;

export function encodeKeys(keys: string[]): string {
  return keys.map((key) => encodeURIComponent(key)).join("/");
}

export function makeDatasetId(keys: string[]): string {
  return keys.join("\u001f");
}

async function requestJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API}${path}`);
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    const suffix = detail ? `: ${detail}` : "";
    throw new Error(`${response.status} ${response.statusText}${suffix}`);
  }
  return (await response.json()) as T;
}

export async function fetchKeys(): Promise<string[]> {
  const payload = await requestJson<KeysResponse>("/keys");
  return payload.keys.map((item) => item.key);
}

export async function fetchDatasets(): Promise<ServerDataset[]> {
  const keyNames = await fetchKeys();
  if (keyNames.length === 0) {
    throw new Error("The server did not return any dataset keys");
  }

  const datasets: ServerDataset[] = [];
  for (let page = 0; ; page += 1) {
    const payload = await requestJson<DatasetsResponse>(
      `/datasets?limit=${DATASET_PAGE_SIZE}&page=${page}`
    );
    const rows = payload.datasets ?? [];

    for (const row of rows) {
      const keys = keyNames.map((keyName) => row[keyName]);
      if (keys.some((key) => typeof key !== "string")) continue;

      const file = keys[keys.length - 1];
      datasets.push({
        keys,
        datasetId: makeDatasetId(keys),
        label: keys.join(" / "),
        file,
        someKeys: encodeKeys(keys.slice(0, -1)),
      });
    }

    if (rows.length < DATASET_PAGE_SIZE) break;
  }

  return datasets;
}

export async function fetchMetadata(dataset: {
  keys: string[];
}): Promise<ServerMetadata> {
  return requestJson<ServerMetadata>(`/metadata/${encodeKeys(dataset.keys)}`);
}

async function probeOneTile(dataset: ServerDataset): Promise<[number, number] | null> {
  if (typeof Image === "undefined") return null;

  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const finish = (size: [number, number] | null) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      resolve(size);
    };

    timer = setTimeout(() => finish(null), 5000);
    image.onload = () => {
      const width = image.naturalWidth;
      const height = image.naturalHeight;
      finish(width > 0 && height > 0 ? [width, height] : null);
    };
    image.onerror = () => finish(null);

    const stretch = encodeURIComponent(JSON.stringify([0, 1]));
    image.src = `${API}/singleband/${encodeKeys(dataset.keys)}/0/0/0.png?stretch_range=${stretch}`;
  });
}

export async function probeTileSize(
  datasets: ServerDataset[]
): Promise<[number, number]> {
  for (const dataset of datasets.slice(0, 3)) {
    const size = await probeOneTile(dataset);
    if (size) return size;
  }
  return [256, 256];
}

export async function loadServerConfig(): Promise<{
  datasets: ServerDataset[];
  tileSize: [number, number];
}> {
  const datasets = await fetchDatasets();
  const tileSize = await probeTileSize(datasets);
  return { datasets, tileSize };
}
