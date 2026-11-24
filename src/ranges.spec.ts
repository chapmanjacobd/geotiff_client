import { describe, expect, it } from "vitest";
import {
  clampFilterMax,
  clampFilterMin,
  clampStretchMax,
  clampStretchMin,
  initialFilterRange,
  initialStretch,
  stretchBounds,
} from "./ranges";

describe("range helpers", () => {
  const bounds = { min: 0, max: 10 };

  it("starts stretch at the full data range", () => {
    expect(initialStretch(bounds)).toEqual(bounds);
  });

  it("gives constant datasets a usable stretch window", () => {
    expect(initialStretch({ min: 5, max: 5 })).toEqual({ min: 5, max: 6 });
    expect(stretchBounds({ min: 5, max: 5 })).toEqual({ min: 5, max: 6 });
  });

  it("clamps filter bounds without crossing", () => {
    const cases = [
      {
        name: "min above max falls back to max",
        range: { min: 2, max: 8 },
        value: 99,
        apply: clampFilterMin,
        expected: { min: 8, max: 8 },
      },
      {
        name: "min below bounds is clamped",
        range: { min: 2, max: 8 },
        value: -1,
        apply: clampFilterMin,
        expected: { min: 0, max: 8 },
      },
      {
        name: "max below min falls back to min",
        range: { min: 2, max: 8 },
        value: -1,
        apply: clampFilterMax,
        expected: { min: 2, max: 2 },
      },
      {
        name: "max above bounds is clamped",
        range: { min: 2, max: 8 },
        value: 99,
        apply: clampFilterMax,
        expected: { min: 2, max: 10 },
      },
    ];

    for (const testCase of cases) {
      expect(
        testCase.apply(testCase.range, bounds, testCase.value),
        testCase.name
      ).toEqual(testCase.expected);
    }
  });

  it("keeps stretch mins below the max", () => {
    const range = { min: 1, max: 9 };

    for (const value of [-10, 0, 5, 9, 10, 100]) {
      const next = clampStretchMin(range, bounds, value);
      expect(next.min).toBeLessThan(next.max);
      expect(next.min).toBeGreaterThanOrEqual(bounds.min);
      expect(next.max).toBeLessThanOrEqual(bounds.max);
    }
  });

  it("keeps stretch maxes above the min", () => {
    const range = { min: 1, max: 9 };

    for (const value of [-10, 0, 5, 9, 10, 100]) {
      const next = clampStretchMax(range, bounds, value);
      expect(next.min).toBeLessThan(next.max);
      expect(next.min).toBeGreaterThanOrEqual(bounds.min);
      expect(next.max).toBeLessThanOrEqual(bounds.max);
    }
  });

  it("keeps stretch bounds ordered for constant datasets", () => {
    const constant = { min: 5, max: 5 };

    expect(initialStretch(constant)).toEqual({ min: 5, max: 6 });
    expect(clampStretchMin({ min: 5, max: 6 }, constant, 99)).toEqual({
      min: 6 - 1e-6,
      max: 6,
    });
    expect(clampStretchMax({ min: 5, max: 6 }, constant, -99)).toEqual({
      min: 5,
      max: 5 + 1e-6,
    });
  });

  it("excludes zero background from the initial filter range", () => {
    const cases = [
      {
        name: "no percentile data keeps the full range",
        bounds: { min: 0, max: 10 },
        percentiles: undefined,
        expected: { min: 0, max: 10 },
      },
      {
        name: "a non-zero median keeps zero",
        bounds: { min: 0, max: 10 },
        percentiles: [0, 1, 2, 3, 4],
        expected: { min: 0, max: 10 },
      },
      {
        name: "non-zero minimum is unchanged",
        bounds: { min: 1, max: 10 },
        percentiles: [1, 1, 1],
        expected: { min: 1, max: 10 },
      },
      {
        name: "sparse integer counts start at one",
        bounds: { min: 0, max: 8954 },
        percentiles: [0, 0, 0, 0, 0],
        expected: { min: 1, max: 8954 },
      },
      {
        name: "the first positive percentile is used",
        bounds: { min: 0, max: 10 },
        percentiles: [0, 0, 0, 0.5, 2],
        expected: { min: 0.5, max: 10 },
      },
      {
        name: "sparse non-integer data excludes exactly zero",
        bounds: { min: 0, max: 0.5 },
        percentiles: [0, 0, 0, 0, 0],
        expected: { min: 5e-7, max: 0.5 },
      },
    ];

    for (const testCase of cases) {
      expect(
        initialFilterRange(testCase.bounds, testCase.percentiles),
        testCase.name
      ).toEqual(testCase.expected);
    }
  });
});
