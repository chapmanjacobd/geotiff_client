export interface LayerRange {
  min: number;
  max: number;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * The range a user is allowed to stretch to.
 *
 * A constant dataset has no usable range, so give it a one-unit window.
 * The server rejects stretch ranges whose upper bound is not greater than
 * the lower bound.
 */
export function stretchBounds(bounds: LayerRange): LayerRange {
  if (bounds.max > bounds.min) return { ...bounds };
  return { min: bounds.min, max: bounds.min + 1 };
}

export function initialStretch(bounds: LayerRange): LayerRange {
  return stretchBounds(bounds);
}

export function stretchEpsilon(bounds: LayerRange): number {
  const usable = stretchBounds(bounds);
  return Math.max((usable.max - usable.min) * 1e-6, 1e-9);
}

export function clampFilterMin(
  range: LayerRange,
  bounds: LayerRange,
  value: number
): LayerRange {
  return {
    min: clamp(value, bounds.min, range.max),
    max: range.max,
  };
}

export function clampFilterMax(
  range: LayerRange,
  bounds: LayerRange,
  value: number
): LayerRange {
  return {
    min: range.min,
    max: clamp(value, range.min, bounds.max),
  };
}

export function clampStretchMin(
  range: LayerRange,
  bounds: LayerRange,
  value: number
): LayerRange {
  const usable = stretchBounds(bounds);
  const epsilon = stretchEpsilon(bounds);
  const max = Math.max(range.max, usable.min + epsilon);
  return {
    min: clamp(value, usable.min, Math.min(usable.max - epsilon, max - epsilon)),
    max: Math.min(max, usable.max),
  };
}

export function clampStretchMax(
  range: LayerRange,
  bounds: LayerRange,
  value: number
): LayerRange {
  const usable = stretchBounds(bounds);
  const epsilon = stretchEpsilon(bounds);
  const min = Math.min(range.min, usable.max - epsilon);
  return {
    min: Math.max(min, usable.min),
    max: clamp(value, min + epsilon, usable.max),
  };
}

/**
 * Pick the initial filter range after loading a variable.
 *
 * Count rasters often report 0 as both the minimum and the median because most
 * pixels are background. Including that background makes a sparse layer paint
 * an opaque veil over the basemap, so exclude zero in that case. Datasets whose
 * median is above the minimum keep their full range.
 *
 * @param bounds Server-reported value range.
 * @param percentiles Optional server percentiles, lowest first.
 * @returns Filter range to use before the user changes any sliders.
 */
export function initialFilterRange(
  bounds: LayerRange,
  percentiles?: number[]
): LayerRange {
  const full = { ...bounds };
  if (bounds.min !== 0 || bounds.max <= 0) return full;
  if (!percentiles || percentiles.length === 0) return full;

  const median = percentiles[Math.floor(percentiles.length / 2)];
  if (median !== 0) return full;

  const firstPositive = percentiles.find((value) => value > 0);
  if (firstPositive !== undefined) {
    return { min: firstPositive, max: bounds.max };
  }

  if (Number.isInteger(bounds.min) && Number.isInteger(bounds.max)) {
    return { min: Math.min(1, bounds.max), max: bounds.max };
  }

  return {
    min: bounds.min + (bounds.max - bounds.min) * 1e-6,
    max: bounds.max,
  };
}
