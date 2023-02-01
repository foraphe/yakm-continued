//import * as L from "leaflet";
//import * as $ from "jquery";

export interface TileInfo {
  url: string;
  size: number;
  mtime: number;
}

export type TilesConfig = { [zxy: string]: TileInfo };

export interface MapInfo {
  z_original: number;
  z_maxscale: number;
  z_initial: number;
  offset: [number, number];
  bounds: [[number, number], [number, number]];
  tile_size: number;
  attribution: string;
  preview: [number, number];
  tiles_list?: string;
  markers?: string;
}

export interface MarkerInfo {
  x: number;
  z: number;
  title: string;
  description?: string;
  category?: string;
  color?: string;
}

export type MarkersConfig = Array<MarkerInfo>;

export class MapDataConfig {
  info: MapInfo;
  tiles: TilesConfig;
  markers: MarkersConfig;

  constructor() {
    this.info = null;
    this.tiles = {};
    this.markers = [];
  }

  async request(url: string) {
    this.info = await MapDataConfig.load(url, "config");
    const url1 = this.info.tiles_list;
    if (url1) {
      this.tiles = await MapDataConfig.load(url1, "config");
    }
    const url2 = this.info.markers;
    if (url2) {
      this.markers = await MapDataConfig.load(url2, "config");
    }
    return this;
  }

  getZoomRange() {
    const z0 = this.info.z_original;
    const zS = this.info.z_maxscale;
    const zI = this.info.z_initial || parseInt(String((z0 + zS) / 2))
    if (z0 > zS) {
      return { maxZoom: z0, minZoom: zS, initialZoom: zI };
    } else {
      return { maxZoom: zS, minZoom: z0, initialZoom: zI };
    }
  }

  getMapOffset() {
    return L.point(this.info.offset);
  }

  getBounds() {
    return L.bounds(this.info.bounds);
  }

  getTileLayerOptions(option?: L.TileLayerOptions) {
    option = option || {};
    const info = this.info;
    let { maxZoom, minZoom } = this.getZoomRange();
    option.zoomReverse = info.z_maxscale > info.z_original;
    option.maxZoom = maxZoom + 4;
    option.maxNativeZoom = maxZoom;
    option.minZoom = minZoom;
    option.tileSize = info.tile_size;
    option.attribution = info.attribution;
    option.bounds = L.latLngBounds(info.bounds);
    return option;
  }

  getTilesConfig() {
    return this.tiles;
  }

  getMarkersConfig() {
    return this.markers;
  }

  setMapPreview(map: L.Map) {
    const info = this.info;
    map.setView(info.preview, (info.z_original + info.tile_size) >> 1);
  }

  static async load(url: string, jsonCallback: string) {
    if (url.endsWith("js")) {
      return $.ajax({
        url,
        dataType: "jsonp",
        jsonpCallback: jsonCallback
      }).then((data) => {
        console.debug(`[received] ${url}`);
        return data;
      });
    } else {
      return fetch(url).then((resp) => resp.json());
    }
  }
}

export async function sleep(time: number) {
  return new Promise(
    (resolve: (...args: any[]) => void, reject: (...args: any[]) => void) => {
      setTimeout(resolve, time);
    }
  );
}

// export async function load(url: string, jsonCallback: string) {
//   return new Promise(
//     (resolve: (cfg: any) => void, reject: (e: any) => void) => {
//       window[jsonCallback] = function (data: any) {
//         try {
//           const s = JSON.stringify(data);
//           window[jsonCallback] = undefined;
//           setTimeout(() => {
//             const obj = JSON.parse(s);
//             resolve(obj);
//           }, 1);
//         } catch (e) {
//           reject(e);
//         }
//       };
//       let req = document.createElement("script");
//       req.type = "text/javascript";
//       req.src = url;
//       req.onload = function (ev) {
//         console.debug(`received ${url}`);
//       };
//       req.onerror = function (ev) {
//         req.remove();
//         window[jsonCallback] = undefined;
//         reject(Error(`Loading failed for the <script> with source ${url}`));
//       };

//       document.head.appendChild(req);
//     }
//   );
// }

export function parseQuery() {
  let query = window.location.search;
  let queryPair: { [key: string]: string } = {};
  if (query.startsWith("?")) {
    query = query.substring(1);
    query.split("&").forEach((pair) => {
      let m = pair.split("=", 2);
      let key = m[0];
      let val = m[1];
      queryPair[key] = val;
    });
  }
  return queryPair;
}
