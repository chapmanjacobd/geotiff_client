/*
function refreshLeaflet(app) {
  map.eachLayer(function (layer) {
    // if deleted
    // if new
    // update attributes
    console.log(layer);
    if (!layer._url.includes(API))
      map.removeLayer(layer);
  });

}

function addSingleband(tileUrl = singleband_url(Alpine.store('settings').selectedDataset)) {
  // fetch_range('osm_coffee_shop')
  var lastAddedRaster = L.tileLayer(tileUrl, {
    noWrap: true, bounds: [[-90, -180], [90, 180]]
  }).addTo(map);

  lastAddedRaster.bringToFront()
}


const singleband_url = (keys, queryParams = {}) => {
  const queryString = new URLSearchParams(queryParams).toString()

  return `${API}/singleband/${keys}/{z}/{x}/{y}.png?${queryString}`
}




/4/8/8.png?colormap=viridis
&expression=setmask(v1, getmask(masked_outside(v1, 1, 303128.375)) | getmask(masked_outside(v2, 1, 1092389.75)))
&v1=Africa-Access_to_electricity,_Population-2012_04
&v2=Global-Population_Count_1_3_1-2020
&stretch_range=[0.0, 3031.2837500000023]






*/

function updateLayers(node, _layers) {
  return {
    update(currentLayers) {
      const oldLayers = map.getLayers();
      if (oldLayers) {
        oldLayers.forEach((oldLayer) => {
          map.removeLayer(oldLayer);
        });
      }
      currentLayers.forEach((currentLayer) => {
        const { type, style } = currentLayer;
        if (layerTypes[type]) {
          const olLayer = layerTypes[type](currentLayer, projection);
          if (olLayer) {
            map.addLayer(olLayer);
            olLayer.setStyle(audioStyle(currentLayer));
          }
        }
      });
    },
  };
}

markerGroup = new ol.layer.Group({
  layers: [],
  name: "markerGroup",
});

var map = new Map({
  target: "map",
  layers: [this.markerGroup],
});

// Get the Layer you want to edit, it can be a variable or directly part of the map
// I prefer storing my markers in a variable
this.markerGroup.getLayers().array_.push(vectorLayer); // getLayers().getArray(); ?
// this.map.get("markerGroup").getLayers() should return the same array

this.map.removeLayers(this.markerGroup);
this.map.addLayers(this.markerGroup);

// https://openlayers.org/en/latest/examples/side-by-side.html
const roadLayer = new TileLayer({
  source: new XYZ({
    attributions: attributions,
    url: "https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=" + key,
    tileSize: 512,
    maxZoom: 22,
  }),
});

const aerialLayer = new TileLayer({
  source: new XYZ({
    attributions: attributions,
    url: "https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=" + key,
    maxZoom: 20,
  }),
});

const view = new View({
  center: [-6655.5402445057125, 6709968.258934638],
  zoom: 13,
});

const map1 = new Map({
  target: "roadMap",
  layers: [roadLayer],
  view: view,
});

const map2 = new Map({
  target: "aerialMap",
  layers: [aerialLayer],
  view: view,
});

// this layer has transparency, so do not fade tiles:
new TileLayer({
  source: new TileJSON({
    url: "https://api.tiles.mapbox.com/v4/mapbox.va-quake-aug.json?secure&access_token=" + key,
    crossOrigin: "anonymous",
    // this layer has transparency, so do not fade tiles:
    transition: 0,
  }),
}),
  // https://openlayers.org/en/latest/examples/reusable-source.html

  source.setUrl();

// https://openlayers.org/en/latest/examples/raster.html

// lazy source
const source = new OSM();

const layer = new TileLayer();

const map = new Map({
  layers: [layer],
  target: "map",
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

document.getElementById("set-source").onclick = function () {
  layer.setSource(source);
};

document.getElementById("unset-source").onclick = function () {
  layer.setSource(null);
};

// https://openlayers.org/en/latest/examples/layer-group.html

// https://openlayers.org/en/latest/examples/layer-z-index.html

// https://openlayers.org/en/latest/examples/layer-spy.html
