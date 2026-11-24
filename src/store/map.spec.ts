import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import type { ServerDataset } from "../api";
import { buildComputeUrl, useMapStore } from "./map";
import type { LayerCompute, LayerVar } from "./map";

const makeVar = (overrides: Partial<LayerVar> = {}): LayerVar => ({
  type: "l-compute-variable",
  id: "var-1",
  datasetId: "dataset-a",
  file: "dataset-a",
  label: "dataset-a",
  keys: ["dataset-a"],
  someKeys: "",
  actualRange: { min: 0, max: 10 },
  filteredRange: { min: 0, max: 10 },
  visible: true,
  loading: false,
  error: null,
  ...overrides,
});

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
  outputVarId: overrides.layerVars?.[0]?.id ?? "var-1",
  layerVars: [makeVar()],
  ...overrides,
});

const makeDataset = (file: string): ServerDataset => ({
  keys: [file],
  datasetId: file,
  label: file,
  file,
  someKeys: "",
});

const parseTileUrl = (tileURL: string): URL =>
  new URL(tileURL.replace("{z}/{x}/{y}", "0/0/0"));

const jsonResponse = (body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

describe("buildComputeUrl", () => {
  it("applies the filter even with a single variable", () => {
    const layer = makeComputeLayer();

    const url = parseTileUrl(buildComputeUrl(layer, [256, 256]));

    expect(url.pathname).toBe("/compute/0/0/0.png");
    expect(url.searchParams.get("colormap")).toBe("accent_r");
    expect(url.searchParams.get("expression")).toBe(
      "setmask(v1, getmask(masked_outside(v1, 0.000000, 10.000000)))"
    );
    expect(url.searchParams.get("v1")).toBe("dataset-a");
    expect(url.searchParams.get("stretch_range")).toBe("[0,10]");
    expect(url.searchParams.get("tile_size")).toBe("[256,256]");
  });

  it("builds a mask expression from multiple visible variables", () => {
    const layer = makeComputeLayer({
      layerVars: [
        makeVar(),
        makeVar({
          id: "var-2",
          datasetId: "dataset-b",
          file: "dataset-b",
          label: "dataset-b",
          keys: ["dataset-b"],
          actualRange: { min: 0, max: 20 },
          filteredRange: { min: 2, max: 18 },
        }),
      ],
    });

    const url = parseTileUrl(buildComputeUrl(layer, [512, 512]));

    expect(url.searchParams.get("expression")).toBe(
      "setmask(v1, getmask(masked_outside(v1, 0.000000, 10.000000)) | getmask(masked_outside(v2, 2.000000, 18.000000)))"
    );
    expect(url.searchParams.get("v1")).toBe("dataset-a");
    expect(url.searchParams.get("v2")).toBe("dataset-b");
    expect(url.searchParams.get("tile_size")).toBe("[512,512]");
  });

  it("ignores variables that are not included in the mask", () => {
    const layer = makeComputeLayer({
      layerVars: [
        makeVar(),
        makeVar({
          id: "var-2",
          file: "dataset-b",
          visible: false,
        }),
      ],
    });

    const url = parseTileUrl(buildComputeUrl(layer, [256, 256]));

    expect(url.searchParams.get("expression")).toBe(
      "setmask(v1, getmask(masked_outside(v1, 0.000000, 10.000000)))"
    );
    expect(url.searchParams.has("v2")).toBe(false);
  });

  it("includes path keys before the tile coordinates", () => {
    const layer = makeComputeLayer({
      layerVars: [makeVar({ keys: ["group", "dataset-a"], someKeys: "group" })],
    });

    const url = parseTileUrl(buildComputeUrl(layer, [256, 256]));

    expect(url.pathname).toBe("/compute/group/0/0/0.png");
  });

  it("uses the selected output instead of the first variable", () => {
    const layer = makeComputeLayer({
      outputVarId: "var-b",
      stretchedRange: { min: 20, max: 30 },
      layerVars: [
        makeVar({ id: "var-a", file: "dataset-a" }),
        makeVar({
          id: "var-b",
          datasetId: "dataset-b",
          file: "dataset-b",
          label: "dataset-b",
          keys: ["dataset-b"],
          actualRange: { min: 20, max: 30 },
          filteredRange: { min: 20, max: 30 },
        }),
      ],
    });

    const url = parseTileUrl(buildComputeUrl(layer, [256, 256]));

    expect(url.searchParams.get("expression")).toBe(
      "setmask(v1, getmask(masked_outside(v1, 20.000000, 30.000000)) | getmask(masked_outside(v2, 0.000000, 10.000000)))"
    );
    expect(url.searchParams.get("v1")).toBe("dataset-b");
    expect(url.searchParams.get("v2")).toBe("dataset-a");
  });

  it("keeps the URL stable when the display order changes", () => {
    const layer = makeComputeLayer({
      layerVars: [
        makeVar({ id: "var-a", file: "dataset-a" }),
        makeVar({ id: "var-b", file: "dataset-b" }),
      ],
    });

    const before = buildComputeUrl(layer, [256, 256]);
    layer.layerVars.reverse();
    const after = buildComputeUrl(layer, [256, 256]);

    expect(after).toBe(before);
  });

  it("returns no URL while the output metadata is loading", () => {
    const layer = makeComputeLayer({
      layerVars: [makeVar({ loading: true })],
    });

    expect(buildComputeUrl(layer, [256, 256])).toBe("");
  });
});

describe("map store", () => {
  let map: ReturnType<typeof useMapStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    map = useMapStore();
    map.datasets = [makeDataset("dataset-a"), makeDataset("dataset-b")];
    map.tileSize = [512, 512];
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("adds a basemap with a default source", () => {
    const layer = map.addBasemap();

    expect(map.layersCount).toBe(1);
    expect(layer.type).toBe("l-basemap");
    expect(layer.tileURL).toContain("openstreetmap.org");
    expect(layer.attribution).toContain("OpenStreetMap");
  });

  it("loads the catalog and probes the server tile size", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        const url = String(input);
        if (url.endsWith("/keys")) {
          return jsonResponse({ keys: [{ key: "file" }] });
        }
        if (url.includes("/datasets?")) {
          return jsonResponse({
            datasets: [{ file: "dataset-a" }, { file: "dataset-b" }],
            limit: 500,
            page: 0,
          });
        }
        throw new Error(`unexpected request: ${url}`);
      })
    );

    await map.initialize();

    expect(map.layersCount).toBe(1);
    expect(map.layers[0].type).toBe("l-basemap");
    expect(map.datasets.map((dataset) => dataset.file)).toEqual([
      "dataset-a",
      "dataset-b",
    ]);
    expect(map.tileSize).toEqual([256, 256]);
    expect(map.catalogError).toBeNull();
  });

  it("keeps the basemap when the catalog cannot be loaded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("server is down");
      })
    );

    await map.initialize();

    expect(map.layersCount).toBe(1);
    expect(map.catalogError).toContain("server is down");
  });

  it("adds a compute layer and hydrates its range from metadata", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({ range: [1, 9], percentiles: [2, 3] })
      )
    );

    const layer = await map.addLayer("l-compute");

    expect(layer?.type).toBe("l-compute");
    if (!layer || layer.type !== "l-compute") return;

    const layerVar = layer.layerVars[0];
    expect(layerVar.loading).toBe(false);
    expect(layerVar.actualRange).toEqual({ min: 1, max: 9 });
    expect(layerVar.filteredRange).toEqual({ min: 1, max: 9 });
    expect(layer.outputVarId).toBe(layerVar.id);
    expect(layer.stretchedRange).toEqual({ min: 1, max: 9 });
    expect(layer.tileURL).toContain("expression=");
    expect(layer.tileURL).toContain("tile_size=%5B512%2C512%5D");
  });

  it("updates ranges when the dataset changes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ range: [5, 20] }))
    );
    map.layers.push(makeComputeLayer({ id: "layer-1" }));
    const firstVar = (map.layers[0] as LayerCompute).layerVars[0];

    await map.setLayerVarDataset("layer-1", firstVar.id, "dataset-b");

    expect(firstVar.file).toBe("dataset-b");
    expect(firstVar.actualRange).toEqual({ min: 5, max: 20 });
    expect(firstVar.filteredRange).toEqual({ min: 5, max: 20 });
    expect((map.layers[0] as LayerCompute).stretchedRange).toEqual({
      min: 5,
      max: 20,
    });
  });

  it("selects a different output and resets stretch to its range", () => {
    const layer = makeComputeLayer({
      id: "layer-1",
      layerVars: [
        makeVar({ id: "a", file: "a", actualRange: { min: 0, max: 10 } }),
        makeVar({
          id: "b",
          file: "b",
          actualRange: { min: 20, max: 30 },
          visible: false,
        }),
      ],
    });
    map.layers.push(layer);

    map.setOutputVar("layer-1", "b");

    expect(layer.outputVarId).toBe("b");
    expect(layer.stretchedRange).toEqual({ min: 20, max: 30 });
    expect(layer.layerVars[1].visible).toBe(true);

    const url = parseTileUrl(buildComputeUrl(layer, [256, 256]));
    expect(url.searchParams.get("v1")).toBe("b");
    expect(url.searchParams.get("v2")).toBe("a");
  });

  it("moves variables without changing the selected output", () => {
    const layer = makeComputeLayer({
      id: "layer-1",
      stretchedRange: { min: 0, max: 10 },
      layerVars: [
        makeVar({ id: "a", file: "a", actualRange: { min: 0, max: 10 } }),
        makeVar({ id: "b", file: "b", actualRange: { min: 2, max: 4 } }),
        makeVar({ id: "c", file: "c", actualRange: { min: 50, max: 60 } }),
      ],
    });
    map.layers.push(layer);

    map.moveLayerVarUp("layer-1", "c");
    expect(layer.layerVars.map((layerVar) => layerVar.id)).toEqual([
      "a",
      "c",
      "b",
    ]);

    map.moveLayerVarDown("layer-1", "a");
    expect(layer.layerVars.map((layerVar) => layerVar.id)).toEqual([
      "c",
      "a",
      "b",
    ]);
    expect(layer.outputVarId).toBe("a");
    expect(layer.stretchedRange).toEqual({ min: 0, max: 10 });
    expect(layer.layerVars.every(Boolean)).toBe(true);
  });

  it("does nothing when moving a variable past the end", () => {
    const layer = makeComputeLayer({
      id: "layer-1",
      layerVars: [makeVar({ id: "a" }), makeVar({ id: "b" })],
    });
    map.layers.push(layer);

    map.moveLayerVarUp("layer-1", "a");
    map.moveLayerVarDown("layer-1", "b");

    expect(layer.layerVars.map((layerVar) => layerVar.id)).toEqual(["a", "b"]);
    expect(layer.layerVars).toHaveLength(2);
  });

  it("promotes the next variable when the output is removed", () => {
    const layer = makeComputeLayer({
      id: "layer-1",
      layerVars: [
        makeVar({ id: "a", actualRange: { min: 0, max: 10 } }),
        makeVar({ id: "b", actualRange: { min: 20, max: 30 }, visible: false }),
      ],
    });
    map.layers.push(layer);

    map.removeLayerVar("layer-1", "a");

    expect(layer.layerVars).toHaveLength(1);
    expect(layer.layerVars[0].id).toBe("b");
    expect(layer.outputVarId).toBe("b");
    expect(layer.layerVars[0].visible).toBe(true);
    expect(layer.stretchedRange).toEqual({ min: 20, max: 30 });
  });

  it("caps the number of variables at five", async () => {
    const layer = makeComputeLayer({
      id: "layer-1",
      layerVars: [
        makeVar({ id: "a" }),
        makeVar({ id: "b" }),
        makeVar({ id: "c" }),
        makeVar({ id: "d" }),
        makeVar({ id: "e" }),
      ],
    });
    map.layers.push(layer);

    await map.addLayerVar("layer-1");

    expect(layer.layerVars).toHaveLength(5);
  });

  it("clamps filter ranges so min never exceeds max", () => {
    map.layers.push(makeComputeLayer({ id: "layer-1" }));

    map.setFilteredMin("layer-1", "var-1", 999);
    map.setFilteredMax("layer-1", "var-1", -5);

    const layerVar = (map.layers[0] as LayerCompute).layerVars[0];
    expect(layerVar.filteredRange.min).toBeLessThanOrEqual(
      layerVar.filteredRange.max
    );
    expect(layerVar.filteredRange.min).toBeGreaterThanOrEqual(0);
    expect(layerVar.filteredRange.max).toBeLessThanOrEqual(10);
  });

  it("keeps stretch bounds strictly ordered", () => {
    map.layers.push(makeComputeLayer({ id: "layer-1" }));

    map.setStretchMin("layer-1", 10);
    let layer = map.layers[0] as LayerCompute;
    expect(layer.stretchedRange.min).toBeLessThan(layer.stretchedRange.max);

    map.setStretchMax("layer-1", -100);
    layer = map.layers[0] as LayerCompute;
    expect(layer.stretchedRange.min).toBeLessThan(layer.stretchedRange.max);
  });

  it("moves layers forward and backward with bounds checks", () => {
    map.addBasemap();
    map.addBasemap();
    const [first, second] = map.layers.map((layer) => layer.id);

    map.moveLayerForward(first);
    expect(map.layers.map((layer) => layer.id)).toEqual([second, first]);

    map.moveLayerBackward(first);
    expect(map.layers.map((layer) => layer.id)).toEqual([first, second]);

    map.moveLayerForward(second);
    expect(map.layers.map((layer) => layer.id)).toEqual([first, second]);
  });
});
