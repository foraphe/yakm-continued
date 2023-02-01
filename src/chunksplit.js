//import * as L from "leaflet";

L.ChunkSplit = L.Layer.extend({
  initialize: function (stage, axisOptions, lineOptions) {
    this.stage = stage || [
      { level: 0, interval: 16 },
      { level: 2, interval: 256 },
      { level: 5, interval: 1024 }
    ];
    this.stage.sort((a, b) => a.level - b.level);
    this.axisOptions = axisOptions || {};
    this.lineOptions = lineOptions || {};
    this.axis = null;
    this.lines = null;
    this.map = null;
    this.interval = 16;
  },

  onAdd: function (map) {
    this.map = map;
    this._generateInterval();
    this.axis = new L.Polyline(this._generateAxis(), this.axisOptions);
    this.lines = new L.Polyline(this._generateLines(), this.lineOptions);
    this.axis.addTo(map);
    this.lines.addTo(map);
    this.map.on("move zoomstart zoomend", this._update, this);
  },

  onRemove: function (map) {
    this.map.off("move zoomstart zoomend", this._update, this);
    this.axis.remove();
    this.lines.remove();
    this.axis = null;
    this.lines = null;
    this.map = null;
  },

  _generateInterval: function () {
    const map = this.map;
    const level = map.getMaxZoom() - map.getZoom();
    const stage = this.stage;
    let interval = stage[0].interval;
    for (let i = 1; i < stage.length; ++i) {
      const tuple = stage[i];
      if (level < tuple.level) {
        break;
      }
      interval = tuple.interval;
    }
    return (this.interval = interval);
  },

  _generateAxis: function () {
    const bounds = this.map.getBounds();
    let axisX = [
      new L.LatLng(0, bounds.getWest()),
      new L.LatLng(0, bounds.getEast())
    ];
    let axisY = [
      new L.LatLng(bounds.getNorth(), 0),
      new L.LatLng(bounds.getSouth(), 0)
    ];
    return [axisX, axisY];
  },

  _generateLines: function (interval) {
    interval = interval || this.interval;
    const bounds = this.map.getBounds();
    const west = bounds.getWest();
    const east = bounds.getEast();
    const north = bounds.getNorth();
    const south = bounds.getSouth();
    let lines = [];
    for (let i = interval; i <= east; i += interval) {
      let line = [new L.LatLng(north, i), new L.LatLng(south, i)];
      lines.push(line);
    }
    for (let i = -interval; i >= west; i -= interval) {
      let line = [new L.LatLng(north, i), new L.LatLng(south, i)];
      lines.push(line);
    }
    for (let i = interval; i <= north; i += interval) {
      let line = [new L.LatLng(i, west), new L.LatLng(i, east)];
      lines.push(line);
    }
    for (let i = -interval; i >= south; i -= interval) {
      let line = [new L.LatLng(i, west), new L.LatLng(i, east)];
      lines.push(line);
    }
    return lines;
  },

  _update: function (evt) {
    switch (evt.type) {
      case "zoomend":
        this._generateInterval();
        this.axis.setLatLngs(this._generateAxis());
        this.lines.setLatLngs(this._generateLines());
        break;
      case "zoomstart":
        break;
      case "move":
        this.axis.setLatLngs(this._generateAxis());
        this.lines.setLatLngs(this._generateLines());
        break;
      default:
        break;
    }
  }
});

export class ChunkSplit extends L.ChunkSplit {}
