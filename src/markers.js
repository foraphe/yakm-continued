import L from "leaflet";
import { Color, Solver } from "./color";
import { SVGIcon } from "./svgicon"

import "./markers.css";

let colorCache = {};

L.MarkersLayer = L.Layer.extend({
  options: {
    defaultColor: "#FFDD66",
    autoResizeZoom: null,
    autoResizeScale: 0.5,
  },

  initialize: function (config /*: MarkersConfig*/, options) {
    L.Util.setOptions(this, options);
    this._map = null;
    let markers = (this.markers = []);
    let data = (this.data = []);
    for (const m of config) {
      let { marker, markerData } = this.createMarker(m);
      data.push(markerData);
      markers.push(marker);
    }
  },

  onZoomLevelChange(e) {
    const autoResizeZoom = this.options.autoResizeZoom;
    if(autoResizeZoom) {
      const map = e.sourceTarget;
      const zoom = map.getZoom();
      if(zoom <= autoResizeZoom) {
        const scale = Math.pow(this.options.autoResizeScale, autoResizeZoom - zoom);
        console.debug(zoom, scale, this.markers);
        this.markers.forEach(function(marker) {
          const icon = marker.options.icon;
          if(icon && icon.updateSize) {
            icon.updateSize(scale);
          }
        })
      }
    }
  },

  onAdd: function (map /*: L.Map*/) {
    for (const marker of this.markers) {
      map.addLayer(marker);
    }
    map.on("zoom", this.onZoomLevelChange, this);
  },

  onRemove: function (map /*: L.Map*/) {
    map.off("zoom", this.onZoomLevelChange, this);
    for (const marker of this.markers) {
      map.removeLayer(marker);
    }
  },

  createMarker: function (markerData /*: MarkerInfo*/) {
    let icon = new SVGIcon({
      iconUrl: "/assets/marker/local-two.svg",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      color: markerData.color || this.options.defaultColor
    });
    let marker = new L.Marker(new L.LatLng(markerData.z, markerData.x), {
      icon: icon
    });
    marker.bindPopup(this.createPopup(markerData));
    console.debug(marker);
    let handler = {
      set: function (obj, prop, value) {
        obj[prop] = value;
        switch (prop) {
          case "x":
          case "z":
            marker.setLatLng(new L.LatLng(obj.z, obj.x));
            break;
          case "title":
          case "description":
            marker.bindPopup(this.createMarker(obj));
            break;
          case "color":
            icon.color = obj.color;
            marker.setIcon(icon);
            break;
          default:
            break;
        }
      }
    };
    markerData = new Proxy(markerData, handler);
    return { marker, markerData };
  },

  createPopup: function (markerData /*: MarkerInfo*/) {
    let container = L.DomUtil.create(
      "div",
      "leaflet-popup-customcontent-container"
    );
    let title = L.DomUtil.create(
      "strong",
      "leaflet-popup-customcontent-title",
      container
    );
    title.innerText = markerData.title;
    let coord = L.DomUtil.create(
      "div",
      "leaflet-popup-customcontent-coordinate",
      container
    );
    L.DomUtil.create(
      "span",
      "leaflet-popup-customcontent-coordinate-head",
      coord
    ).innerText = "x";
    L.DomUtil.create(
      "span",
      "leaflet-popup-customcontent-coordinate-value",
      coord
    ).innerText = String(markerData.x);
    L.DomUtil.create(
      "span",
      "leaflet-popup-customcontent-coordinate-head",
      coord
    ).innerText = "z";
    L.DomUtil.create(
      "span",
      "leaflet-popup-customcontent-coordinate-value",
      coord
    ).innerText = String(markerData.z);
    if ("y" in markerData) {
      L.DomUtil.create(
        "span",
        "leaflet-popup-customcontent-coordinate-head",
        coord
      ).innerText = "y";
      L.DomUtil.create(
        "span",
        "leaflet-popup-customcontent-coordinate-value",
        coord
      ).innerText = String(markerData.y);
    }
    if (markerData.description) {
      L.DomUtil.create(
        "br",
        "leaflet-popup-customcontent-description-breakline",
        container
      );
      let description = L.DomUtil.create(
        "div",
        "leaflet-popup-customcontent-description",
        container
      );
      description.innerHTML = markerData.description;
    }
    return container;
  }
});

export class MarkersLayer extends L.MarkersLayer {}
