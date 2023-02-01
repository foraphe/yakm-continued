//import * as L from 'leaflet'

export class Minecraft2DCRS {
  constructor(minZoom, maxZoom, offset) {
    offset = offset || new L.Point(0, 0);
    L.Util.extend(this, L.CRS.Simple);
    const scale = Math.pow(0.5, maxZoom - minZoom);
    this.transformation = new L.Transformation(scale, offset.x, scale, offset.y);
  }
}
