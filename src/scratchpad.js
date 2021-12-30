
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

  var newlayer = L.tileLayer(basemap_url, {
    noWrap: true, bounds: [[-90, -180], [90, 180]]
  }).addTo(map);

  basemap.bringToBack()
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

*/

const compute_url = (keys, queryParams = {}) => {
  const queryString = new URLSearchParams(queryParams).toString()

  return `${API}/compute/${keys}/{z}/{x}/{y}.png?${queryString}`
}

const fetch_range = async (dataset) => {
  fetch(`${API}/metadata/${dataset}`)
    .then((r) => {
      r.json().then(j => {
        console.log(j);
        return j['range'];
      })
    })
}


document.addEventListener('alpine:init', () => {

  Alpine.store('settings', {
    colorscale: 'viridis'
  })


  // keep track which tileLayers exist and re-create them?



})



/4/8/8.png?colormap=viridis
&expression=setmask(v1, getmask(masked_outside(v1, 1, 303128.375)) | getmask(masked_outside(v2, 1, 1092389.75)))
&v1=Africa-Access_to_electricity,_Population-2012_04
&v2=Global-Population_Count_1_3_1-2020
&stretch_range=[0.0, 3031.2837500000023]



              dcc.RangeSlider(
                  id="filter_slider1",
                  min=0,
                  max=1,
                  value=[0, 1],
                  step=0.01,
                  marks={0: "0", 0.5: "0.5", 1: "1"},
              ),
              html.P(children="-", id="label"),
              html.Br(),
              html.Div("Additional filter dataset"),
              dcc.Dropdown(
                  id="select_dataset2",
                  options=[dict(value=p, label=p.upper()) for p in DATASETS],
                  value="Global-Population_Count_1_3_1-2020",
              ),
              html.Br(),
              html.Div("Filter"),
              dcc.RangeSlider(
                  id="filter_slider2",
                  min=1,
                  max=1,
                  value=[0, 1],
                  marks={0: "0", 0.5: "0.5", 1: "1"},
              ),
              dcc.Dropdown(
                  id="dropdown-to-show_or_hide-element",
                  options=[
                      {"label": "Splitview", "value": "on"},
                      {"label": "Oneview", "value": "off"},
                  ],
                  value="on",
              ),
          ],
          className="info",
          style={"width": "30em"},
      ),
  ],
  style={"display": "grid", "width": "100%", "height": "100vh"},
)


@app.callback(Output("terracotta_map", "opacity"), [Input("opacity", "value")])
def update_opacity(opacity):
  return opacity


@app.callback(
  [
      Output("srng", "min"),
      Output("srng", "max"),
      Output("srng", "value"),
      Output("srng", "marks"),
  ],
  [Input("select_dataset1", "value")],
)
def update_stretch_range(param):
  if not param:
      return PreventUpdate
  srng = srng_map[param]
  return (
      srng[0],
      srng[1],
      [srng[0], srng[1] - (srng[1] * 0.99)],
      {v: f"{v:.1f}" for v in srng},
  )


@app.callback(
  [
      Output("filter_slider1", "min"),
      Output("filter_slider1", "max"),
      Output("filter_slider1", "value"),
      Output("filter_slider1", "marks"),
  ],
  [Input("select_dataset1", "value")],
)
def update_stretch_range(param):
  if not param:
      return PreventUpdate
  srng = srng_map[param]
  return (
      srng[0],
      srng[1],
      [srng[0] + 1, srng[1]],
      {v: f"{v:.1f}" for v in srng},
  )


@app.callback(
  [
      Output("filter_slider2", "min"),
      Output("filter_slider2", "max"),
      Output("filter_slider2", "value"),
      Output("filter_slider2", "marks"),
  ],
  [Input("select_dataset2", "value")],
)u
def update_stretch_range(param):
  if not param:
      return PreventUpdate
  srng = srng_map[param]
  return (
      srng[0],
      srng[1],
      [srng[0] + 1, srng[1]],
      {v: f"{v:.1f}" for v in srng},
  )


@app.callback(Output("base_map", "url"), [Input("dd_bmap", "value")])
def update_basemap_url(url):
  return url


@app.callback(
  [
      Output("terracotta_map", "url"),
      Output("cbar", "colorscale"),
      Output("cbar", "min"),
      Output("cbar", "max"),
      Output("cbar", "unit"),
  ],
  [
      Input("select_dataset1", "value"),
      Input("select_dataset2", "value"),
      Input("dd_cmap", "value"),
      Input("srng", "value"),
      Input("filter_slider1", "value"),
      Input("filter_slider2", "value"),
  ],
)
def update_url(dataset1, dataset2, cmap, srng, filter_slider1, filter_slider2):
  if not dataset1 or not dataset2 or not cmap:
      raise PreventUpdate
  srng = [float(item) for item in srng]
  expr1 = f"masked_outside(v1, {filter_slider1[0]}, {filter_slider1[1]})"
  expr2 = f"masked_outside(v2, {filter_slider2[0]}, {filter_slider2[1]})"
  expr = f"setmask(v1, getmask({expr1}) | getmask({expr2}))"
  url = compute_url(
      TC_URL,
      colormap=cmap.lower(),
      expression=expr,
      v1=dataset1,
      v2=dataset2,
      stretch_range=srng,
  )
  # url = singleband_url(TC_URL, dataset1, colormap=cmap.lower(), stretch_range=srng)
  return url, cmap, float(srng[0]), float(srng[1]), unit_map[dataset1]


@app.callback(
  Output("label", "children"),
  [Input("map", "click_lat_lng"), Input("select_dataset1", "value")],
)
def update_label(click_lat_lng, param):
  if not click_lat_lng:
      return "-"
  url = point_url(TC_URL, param, lat=click_lat_lng[0], lon=click_lat_lng[1])
  data = fetch_latlng(url)
  return f"{data:n} {unit_map[param]}"


# 2nd map
@app.callback(
  Output(component_id="splitview", component_property="style"),
  [
      Input(
          component_id="dropdown-to-show_or_hide-element", component_property="value"
      )
  ],
)
def show_hide_element(visibility_state):
  if visibility_state == "on":
      return {"display": "block"}
  if visibility_state == "off":
      return {"display": "none"}


@app.callback(Output("base_map2", "url"), [Input("dd_bmap", "value")])
def update_basemap_url(url):
  return url


@app.callback(Output("terracotta_map2", "opacity"), [Input("opacity", "value")])
def update_opacity(opacity):
  return opacity


@app.callback(
  Output("terracotta_map2", "url"),
  [
      Input("select_dataset1", "value"),
      Input("select_dataset2", "value"),
      Input("dd_cmap", "value"),
      Input("srng", "value"),
      Input("filter_slider1", "value"),
      Input("filter_slider2", "value"),
  ],
)
def update_url(dataset1, dataset2, cmap, srng, filter_slider1, filter_slider2):
  if not dataset1 or not dataset2 or not cmap:
      raise PreventUpdate
  srng = [float(item) for item in srng]
  expr1 = f"masked_outside(v1, {filter_slider1[0]}, {filter_slider1[1]})"
  expr2 = f"masked_outside(v2, {filter_slider2[0]}, {filter_slider2[1]})"
  expr = f"setmask(v1, getmask({expr1}) | getmask({expr2}))"
  url = compute_url(
      TC_URL,
      colormap=cmap.lower(),
      expression=expr,
      v1=dataset1,
      v2=dataset2,
      stretch_range=srng,
  )
  # url = singleband_url(TC_URL, dataset1, colormap=cmap.lower(), stretch_range=srng)
  return url


if DEV:
  app.run_server(port=8050, debug=True)






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
