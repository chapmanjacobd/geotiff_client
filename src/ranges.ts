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
