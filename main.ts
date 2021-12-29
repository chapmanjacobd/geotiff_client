import "./style.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import "ol/ol.css";
import GeoTIFF from "ol/source/GeoTIFF";
import WebGLTileLayer from "ol/layer/WebGLTile";

const source = new GeoTIFF({
  sources: [
    {
      url: "https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/2020/S2A_36QWD_20200701_0_L2A/TCI.tif",
    },
  ],
});

const map = new Map({
  target: "map",
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    new WebGLTileLayer({
      source: source,
    }),
  ],
  // view: new View({
  //   center: [0, 0],
  //   zoom: 2,
  // }),
  view: source.getView(),
});

/*
{
  "projection": {
    "code_": "EPSG:32636",
    "units_": "m",
    "extent_": null,
    "worldExtent_": null,
    "axisOrientation_": "enu",
    "global_": false,
    "canWrapX_": false,
    "defaultTileGrid_": {
      "minZoom": 0,
      "resolutions_": [
        156367.7919628329,
        78183.89598141646,
        39091.94799070823,
        19545.973995354114,
        9772.986997677057,
        4886.4934988385285,
        2443.2467494192642,
        1221.6233747096321,
        610.8116873548161,
        305.40584367740803,
        152.70292183870401,
        76.35146091935201,
        38.175730459676004,
        19.087865229838002,
        9.543932614919001,
        4.7719663074595005,
        2.3859831537297502,
        1.1929915768648751,
        0.5964957884324376,
        0.2982478942162188,
        0.1491239471081094,
        0.0745619735540547,
        0.03728098677702735,
        0.018640493388513674,
        0.009320246694256837,
        0.004660123347128418,
        0.002330061673564209,
        0.0011650308367821046,
        0.0005825154183910523,
        0.00029125770919552615,
        0.00014562885459776308,
        0.00007281442729888154,
        0.00003640721364944077,
        0.000018203606824720384,
        0.000009101803412360192,
        0.000004550901706180096,
        0.000002275450853090048,
        0.000001137725426545024,
        5.68862713272512e-7,
        2.84431356636256e-7,
        1.42215678318128e-7,
        7.1107839159064e-8,
        3.5553919579532e-8
      ],
      "zoomFactor_": 2,
      "maxZoom": 42,
      "origin_": [
        -20015077.371242613,
        20015077.371242613
      ],
      "origins_": null,
      "tileSizes_": null,
      "tileSize_": 256,
      "extent_": [
        -20015077.371242613,
        -20015077.371242613,
        20015077.371242613,
        20015077.371242613
      ],
      "fullTileRanges_": [
        {
          "minX": 0,
          "maxX": 0,
          "minY": 0,
          "maxY": 0
        },
        {
          "minX": 0,
          "maxX": 1,
          "minY": 0,
          "maxY": 1
        },
        {
          "minX": 0,
          "maxX": 3,
          "minY": 0,
          "maxY": 3
        },
        {
          "minX": 0,
          "maxX": 7,
          "minY": 0,
          "maxY": 7
        },
        {
          "minX": 0,
          "maxX": 15,
          "minY": 0,
          "maxY": 15
        },
        {
          "minX": 0,
          "maxX": 31,
          "minY": 0,
          "maxY": 31
        },
        {
          "minX": 0,
          "maxX": 63,
          "minY": 0,
          "maxY": 63
        },
        {
          "minX": 0,
          "maxX": 127,
          "minY": 0,
          "maxY": 127
        },
        {
          "minX": 0,
          "maxX": 255,
          "minY": 0,
          "maxY": 255
        },
        {
          "minX": 0,
          "maxX": 511,
          "minY": 0,
          "maxY": 511
        },
        {
          "minX": 0,
          "maxX": 1023,
          "minY": 0,
          "maxY": 1023
        },
        {
          "minX": 0,
          "maxX": 2047,
          "minY": 0,
          "maxY": 2047
        },
        {
          "minX": 0,
          "maxX": 4095,
          "minY": 0,
          "maxY": 4095
        },
        {
          "minX": 0,
          "maxX": 8191,
          "minY": 0,
          "maxY": 8191
        },
        {
          "minX": 0,
          "maxX": 16383,
          "minY": 0,
          "maxY": 16383
        },
        {
          "minX": 0,
          "maxX": 32767,
          "minY": 0,
          "maxY": 32767
        },
        {
          "minX": 0,
          "maxX": 65535,
          "minY": 0,
          "maxY": 65535
        },
        {
          "minX": 0,
          "maxX": 131071,
          "minY": 0,
          "maxY": 131071
        },
        {
          "minX": 0,
          "maxX": 262143,
          "minY": 0,
          "maxY": 262143
        },
        {
          "minX": 0,
          "maxX": 524287,
          "minY": 0,
          "maxY": 524287
        },
        {
          "minX": 0,
          "maxX": 1048575,
          "minY": 0,
          "maxY": 1048575
        },
        {
          "minX": 0,
          "maxX": 2097151,
          "minY": 0,
          "maxY": 2097151
        },
        {
          "minX": 0,
          "maxX": 4194303,
          "minY": 0,
          "maxY": 4194303
        },
        {
          "minX": 0,
          "maxX": 8388607,
          "minY": 0,
          "maxY": 8388607
        },
        {
          "minX": 0,
          "maxX": 16777215,
          "minY": 0,
          "maxY": 16777215
        },
        {
          "minX": 0,
          "maxX": 33554431,
          "minY": 0,
          "maxY": 33554431
        },
        {
          "minX": 0,
          "maxX": 67108863,
          "minY": 0,
          "maxY": 67108863
        },
        {
          "minX": 0,
          "maxX": 134217727,
          "minY": 0,
          "maxY": 134217727
        },
        {
          "minX": 0,
          "maxX": 268435455,
          "minY": 0,
          "maxY": 268435455
        },
        {
          "minX": 0,
          "maxX": 536870911,
          "minY": 0,
          "maxY": 536870911
        },
        {
          "minX": 0,
          "maxX": 1073741823,
          "minY": 0,
          "maxY": 1073741823
        },
        {
          "minX": 0,
          "maxX": 2147483647,
          "minY": 0,
          "maxY": 2147483647
        },
        {
          "minX": 0,
          "maxX": 4294967295,
          "minY": 0,
          "maxY": 4294967295
        },
        {
          "minX": 0,
          "maxX": 8589934591,
          "minY": 0,
          "maxY": 8589934591
        },
        {
          "minX": 0,
          "maxX": 17179869183,
          "minY": 0,
          "maxY": 17179869183
        },
        {
          "minX": 0,
          "maxX": 34359738367,
          "minY": 0,
          "maxY": 34359738367
        },
        {
          "minX": 0,
          "maxX": 68719476735,
          "minY": 0,
          "maxY": 68719476735
        },
        {
          "minX": 0,
          "maxX": 137438953471,
          "minY": 0,
          "maxY": 137438953471
        },
        {
          "minX": 0,
          "maxX": 274877906943,
          "minY": 0,
          "maxY": 274877906943
        },
        {
          "minX": 0,
          "maxX": 549755813887,
          "minY": 0,
          "maxY": 549755813887
        },
        {
          "minX": 0,
          "maxX": 1099511627775,
          "minY": 0,
          "maxY": 1099511627775
        },
        {
          "minX": 0,
          "maxX": 2199023255551,
          "minY": 0,
          "maxY": 2199023255551
        },
        {
          "minX": 0,
          "maxX": 4398046511103,
          "minY": 0,
          "maxY": 4398046511103
        }
      ],
      "tmpSize_": [
        256,
        256
      ],
      "tmpExtent_": [
        0,
        0,
        0,
        0
      ]
    },
    "ol_uid": "26"
  },
  "resolutions": [
    159.82532751091702,
    79.97086671522214,
    40,
    20,
    10
  ],
  "center": [
    554880,
    1845120
  ],
  "extent": [
    499980,
    1790220,
    609780,
    1900020
  ],
  "zoom": 0
}
*/
