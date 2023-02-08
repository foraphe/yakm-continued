import L from "leaflet";
import { Color, Solver } from "./color";
import { SVGIcon } from "./svgicon"

import "./markers.css";

let colorCache = {};

L.MarkersLayer = L.Layer.extend({
  options: {
    defaultColor: "#FFDD66"
  },

  initialize: function (config /*: MarkersConfig*/, options) {
    L.Util.setOptions(this, options);
    let markers = (this.markers = []);
    let data = (this.data = []);
    for (const m of config) {
      let { marker, markerData } = this.createMarker(m);
      data.push(markerData);
      markers.push(marker);
    }
  },

  onAdd: function (map /*: L.Map*/) {
    for (const marker of this.markers) {
      map.addLayer(marker);
    }
  },

  onRemove: function (map /*: L.Map*/) {
    for (const marker of this.markers) {
      map.removeLayer(marker);
    }
  },

  createMarker: function (markerData /*: MarkerInfo*/) {
    let icon = new SVGIcon({
      iconUrl: "/assets/marker/local-two.svg",
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      color: markerData.color,
    });
    //icon.color = markerData.color || this.options.defaultColor;
    // icon.createIcon = function (oldIcon) {
    //   let img = this._createIcon("icon", oldIcon);
    //   let color = new Color(this.color);
    //   let icolor = color.toIntRGB();
    //   if (icolor in colorCache) {
    //     img.style.filter = colorCache[icolor];
    //   } else {
    //     let solver = new Solver(color);
    //     let result = solver.solve();
    //     img.style.filter = colorCache[icolor] = result.filter;
    //   }

    //   return img;
    // };
    let marker = new L.Marker(new L.LatLng(markerData.z, markerData.x), {
      icon: icon
    });
    marker.bindPopup(this.createPopup(markerData));
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
