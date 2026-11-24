import { afterEach, describe, expect, it, vi } from "vitest";
import {
  encodeKeys,
  fetchDatasets,
  makeDatasetId,
  probeTileSize,
} from "./api";

const jsonResponse = (body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("api helpers", () => {
  it("encodes key segments and builds stable ids", () => {
    expect(encodeKeys(["group a", "file/b"])).toBe("group%20a/file%2Fb");
    expect(makeDatasetId(["a", "b"])).not.toBe(makeDatasetId(["a", "c"]));
  });

  it("maps datasets from every key returned by /keys", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        const url = String(input);
        if (url.endsWith("/keys")) {
          return jsonResponse({
            keys: [{ key: "group" }, { key: "file" }],
          });
        }
        if (url.includes("/datasets?")) {
          return jsonResponse({
            datasets: [
              { group: "a", file: "one" },
              { group: "a", file: "two" },
            ],
            limit: 500,
            page: 0,
          });
        }
        throw new Error(`unexpected request: ${url}`);
      })
    );

    const datasets = await fetchDatasets();

    expect(datasets).toEqual([
      {
        keys: ["a", "one"],
        datasetId: "a\u001fone",
        label: "a / one",
        file: "one",
        someKeys: "a",
      },
      {
        keys: ["a", "two"],
        datasetId: "a\u001ftwo",
        label: "a / two",
        file: "two",
        someKeys: "a",
      },
    ]);
  });

  it("falls back to 256px when no dataset can be probed", async () => {
    await expect(probeTileSize([])).resolves.toEqual([256, 256]);
  });
});
