
import { Minecraft2DCRS } from "./crs";
import { CoordinatesControl } from "./coordinates";
import { parseQuery, sleep, MapDataConfig, load } from "./config";
import { ListedTileLayer } from "./tilelayer";
import { ChunkSplit } from "./chunksplit";
import { MarkersLayer } from "./markers";
import L from "leaflet";
import L from 'leaflet-draw';
import "./styles.css";
import "leaflet/dist/leaflet.css";

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
  let info = await load(url);
  let cfg = new MapDataConfig(info);
  await cfg.request_full();
  div.innerHTML = "";
  await sleep(100);

  let { minZoom, maxZoom, initialZoom } = cfg.getZoomRange();
  let offset = cfg.getMapOffset();

  let map = new L.Map(div, {
    preferCanvas: true,
    crs: new Minecraft2DCRS(minZoom, maxZoom, offset),
    maxBounds: cfg.info.bounds,
  });

  map.attributionControl.setPrefix('Leaflet');
  map.zoomControl.remove();
  L.control.zoom({
    zoomInTitle: '放大',
    zoomOutTitle: '缩小'
  }).addTo(map);

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

  var drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);
  let drawShapeOptions = {
    color: '#9466FF',
    weight: 3,
    opacity: 0.8,
  }
  let drawControl = new L.Control.Draw({
    edit: {
      featureGroup: drawnItems,
    },
    draw: {
      polyline: {
        shapeOptions: drawShapeOptions
      },
      polygon: {
        shapeOptions: drawShapeOptions
      },
      circle: {
        shapeOptions: drawShapeOptions
      },
      rectangle: {
        shapeOptions: drawShapeOptions
      },
      circlemarker: drawShapeOptions
    },

  });
  map.addControl(drawControl);

  map.on(L.Draw.Event.CREATED, function (e) {
    var layer = e.layer;
    drawnItems.addLayer(layer);
  });

  let markersLayer = new MarkersLayer(cfg.getMarkersConfig(), {});
  markersLayer.addTo(map);

  let ctrl = new L.Control.Layers(
    {
      '主世界': tileLayer
    },
    {
      '网格线': chunkSplitLayer,
      '标记点': markersLayer,
      '绘制的图形': drawnItems,
    }
  );
  ctrl.addTo(map);


  window["map_instance"] = map;
  window["map_data"] = cfg;

  map.setView([0, 0], initialZoom);

  return map;
}

function i18n() {
  L.drawLocal.draw.toolbar = {
    buttons: {
      polyline: '在地图上绘制折线段',
      polygon: '在地图上绘制不规则多边形',
      circle: '在地图上绘制圆',
      rectangle: '在地图上绘制矩形',
      marker: '在地图上添加标记点',
      circlemarker: '在地图上添加圆形标记',
    },
    actions: {
      title: '取消当前图形的绘制',
      text: '取消',
    },
    finish: {
      title: '结束当前图形的绘制',
      text: '结束'
    },
    undo: {
      title: '撤销上一个操作',
      text: '撤销',
    }
  }

  L.drawLocal.draw.handlers = {
    circle: {
      tooltip: {
        start: '按住鼠标左键并拖动以绘制..'
      },
      radius: '半径'
    },
    circlemarker: {
      tooltip: {
        start: '点击鼠标左键以放置圆形标记'
      }
    },
    marker: {
      tooltip: {
        start: '点击鼠标左键以放置标记点'
      }
    },
    polygon: {
      tooltip: {
        start: '点击鼠标左键以放置起点',
        cont: '多边形至少需要三个顶点',
        end: '点击绘制起点以结束绘制'
      }
    },
    polyline: {
      error: '错误',
      tooltip: {
        start: '点击鼠标左键以放置起点',
        cont: '点击最后一个顶点以结束绘制',
        end: '结束绘制',
      }
    },
    rectangle: {
      tooltip: {
        start: '按住鼠标左键并拖动以绘制'
      },
    },
    simpleshape: {
      tooltip: {
        end: '松开鼠标以结束绘制'
      }
    }
  }

  L.drawLocal.edit.toolbar = {
    actions: {
      save: {
        title: '保存更改并退出',
        text: '保存'
      },
      cancel: {
        title: '取消更改并退出',
        text: '取消'
      },
      clearAll: {
        title: '清空所有图形',
        text: '清空'
      }
    },
    buttons: {
      edit: '编辑',
      editDisabled: '没有可编辑的图形',
      remove: '删除',
      removeDisabled: '没有可删除的图形'
    }
  }

  L.drawLocal.edit.handlers = {
    edit: {
      tooltip: {
        text: '点击取消以退出(不保存修改)',
        subtext: '拖动端点以修改图形'
      }
    },
    remove: {
      tooltip: {
        text: '点击图形以删除'
      }
    }
  }
}

async function main() {
  i18n();

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

