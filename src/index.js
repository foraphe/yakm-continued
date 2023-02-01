import "./styles.css";
import { Minecraft2DCRS } from "./crs";
import { CoordinatesControl } from "./coordinates";
import { parseQuery, sleep, MapDataConfig } from "./config";
import { ListedTileLayer } from "./tilelayer";
import { ChunkSplit } from "./chunksplit";
import { MarkersLayer } from "./markers";
// import { TestQTree } from "./qtreemarker"
//import * as L from "leaflet";
//import "leaflet/dist/leaflet.css";

// import "leaflet.coordinates/dist/Leaflet.Coordinates-0.1.5.min.js";
// import "leaflet.coordinates/dist/Leaflet.Coordinates-0.1.5.css";

function fitWindow(container) {
  let w, h;
  if ("innerWidth" in window) {
    w = window.innerWidth;
    h = window.innerHeight;
  } else {
    let doc = document.documentElement || document.body;
    w = doc.clientWidth;
    h = doc.clientHeight;
  }
  container.style.width = String(w - 4) + "px";
  container.style.height = String(Math.max(h * 0.95, h - 10)) + "px";
  container.style.margin = String(2) + "px";
}

async function display(url, div) {
  let cfg = new MapDataConfig();
  await cfg.request(url);
  div.innerHTML = "";
  await sleep(100);

  let { minZoom, maxZoom, initialZoom } = cfg.getZoomRange();
  let offset = cfg.getMapOffset();

  let map = new L.Map(div, {
    preferCanvas: true,
    crs: new Minecraft2DCRS(minZoom, maxZoom, offset),
  });


  let tileLayer = new ListedTileLayer(
    // "https://gitee.com/rankerviber08264/MapDataKedamaV3/raw/master/v3/{z}/{x},{y}.png",
    cfg.getTilesConfig(),
    {
      ...cfg.getTileLayerOptions(),
    }
  );
  tileLayer.addTo(map);

  let coordinates = new CoordinatesControl({
    position: "bottomleft",
    labelHeadLat: "z:",
    labelHeadLng: "x:",
    useLatLngOrder: false
  });
  coordinates.addTo(map);

  cfg.setMapPreview(map);

  let chunkSplitLayer = new ChunkSplit(
    [
      { level: 0, interval: 16 },
      { level: 1, interval: 128 },
      { level: 2, interval: 256 },
      { level: 3, interval: 512 },
      { level: 5, interval: 1024 }
    ],
    {
      color: "#EE8833",
      weight: 1
    },
    {
      color: "#66FFCC",
      weight: 1,
      interactive: false
    }
  );
  // chunkSplitLayer.addTo(map);

  let markersLayer = new MarkersLayer(cfg.getMarkersConfig(), {});
  markersLayer.addTo(map);

  let ctrl = new L.Control.Layers(
    {
      overworld: tileLayer
    },
    {
      "chunk-split": chunkSplitLayer,
      markers: markersLayer
    }
  );
  ctrl.addTo(map);

  window["map_instance"] = map;
  window["map_data"] = cfg;

  map.setView([0,0], initialZoom);

  return map;
}

async function main() {
  let div = document.getElementById("app");
  window.addEventListener("resize", (ev) => fitWindow(div));
  fitWindow(div);

  let query = parseQuery();

  let settingsURL = "/static/settings.json";
  let settings = await fetch(settingsURL).then((resp) => resp.json());

  let sel = settings.default;
  if ("world" in query) {
    let v = query["world"];
    if (v in settings.world) {
      sel = v;
    }
  }

  await display(settings.world[sel], div);
}

main().catch(console.warn);

// map.addEventListener("mousemove", (ev) => {
//   let div = document.getElementById("json");
//   let latlng = ev.latlng;
//   div.innerHTML =
//     "<div><span>" +
//     Math.round(latlng.lat * 100) / 100 +
//     "</span><span>" +
//     Math.round(latlng.lng * 100) / 100 +
//     "</span></div>";
// });

// async function test() {
//   console.log("start");
//   let x = await makeRequest(
//     "https://jsonblob.com/api/jsonBlob/aeb68c8f-bdc4-11ea-8d08-df750c4c388a",
//     "json"
//   );
// }
