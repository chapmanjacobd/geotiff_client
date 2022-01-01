import { API } from "./config";

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}

function array_move(arr, old_index, new_index) {
  while (old_index < 0) {
    old_index += arr.length;
  }
  while (new_index < 0) {
    new_index += arr.length;
  }
  if (new_index >= arr.length) {
    var k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr; // for testing purposes
}

const computeUrl = (someKeys, queryParams = {}) => {
  const queryString = new URLSearchParams(queryParams).toString();

  return `${API}/compute/${someKeys}/{z}/{x}/{y}.png?${queryString}`;
};

const computeQueryParams = (layer: LayerCompute, someKeys = "") => {
  if (layer.layerVars.length === 1) console.log("only one compute var");
  if (layer.layerVars.length > 5) console.log("probably more vars than terracotta wants");

  const expr_proto = layer.layerVars
    .map((v, i) => {
      if (typeof v === typeof undefined) return;
      if (!v.visible) return;
      return `getmask(masked_outside(v${i + 1}, ${v.filteredRange.min}, ${v.filteredRange.max}))`;
    })
    .filter(Boolean);
  const expr = layer.layerVars.length === 1 ? "v1" : `setmask(v1, ${expr_proto.join(" | ")})`;

  const operandKeys = layer.layerVars.reduce((obj, v, i) => {
    if (typeof v === typeof undefined) return obj;
    if (!v.visible) return obj;
    const key = "v" + (i + 1);
    return { ...obj, [key]: v.file };
  }, {});

  return computeUrl(someKeys, {
    colormap: layer.colorScale,
    stretch_range: JSON.stringify([layer.stretchedRange.min, layer.stretchedRange.max]),
    expression: expr,
    ...operandKeys,
  });
};

const fetchRange = async (dataset) => {
  fetch(`${API}/metadata/${dataset}`).then((r) => {
    r.json().then((j) => {
      console.log(j);
      return j["range"];
    });
  });
};

export { computeQueryParams, shuffle, array_move };
