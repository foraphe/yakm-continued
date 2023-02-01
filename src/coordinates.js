//import * as L from "leaflet";

import "./coordinates.css";

L.Control.CoordinatesControl = L.Control.extend({
  options: {
    position: "bottomright",
    //decimals used in latlng value display
    decimalsFormat: (x) => String(Math.round(x)),
    //label head used in display. for example: "Lat:" => "Lat: ${lat}"
    labelHeadLat: "Lat:",
    labelHeadLng: "Lng:",
    useLatLngOrder: false,
    //switch on/off input fields on click
    enableUserInput: true,
    //leaflet marker type
    markerType: L.Marker,
    //leaflet marker properties
    markerProps: {}
  },

  onAdd: function (map) {
    this._map = map;
    let options = this.options;
    let container = (this._container = L.DomUtil.create(
      "div",
      "leaflet-control-coordinates"
    ));
    let labelContainer = (this._labelContainer = L.DomUtil.create(
      "div",
      "leaflet-control-coordinates-label",
      container
    ));
    //
    function _createLabelPair(label, head) {
      let labelHead = L.DomUtil.create(
        "span",
        "leaflet-control-coordinates-label-head",
        label
      );
      labelHead.innerHTML = head;
      let labelValue = L.DomUtil.create(
        "span",
        "leaflet-control-coordinates-label-value",
        label
      );
      return labelValue;
    }
    // label lat
    let labelLat = (this._labelLat = L.DomUtil.create(
      "span",
      "leaflet-control-coordinates-label-lat",
      labelContainer
    ));
    this._labelLatVal = _createLabelPair(labelLat, options.labelHeadLat);

    // label lng
    let labelLng = (this._labelLng = L.DomUtil.create(
      "span",
      "leaflet-control-coordinates-label-lng",
      labelContainer
    ));
    this._labelLngVal = _createLabelPair(labelLng, options.labelHeadLng);

    if (!options.useLatLngOrder) {
      L.DomUtil.toFront(labelLat);
    }

    // status
    this._inputMode = false;
    this._marker = null;

    // connect to events
    map.on("mousemove", this._update, this);

    map.whenReady(this._update, this);

    map.on("click", this._updateMarker, this);

    // wether or not to show inputs on click
    if (options.enableUserInput) {
      L.DomEvent.addListener(this._container, "click", this._switchUI, this);
    }

    return container;
  },

  onRemove: function (map) {
    map.off("mousemove", this._update, this);
  },

  /**
   *	Mousemove callback function updating labels and input elements
   */
  _update: function (evt) {
    let pos = evt.latlng;
    let opts = this.options;
    if (pos) {
      this._currentPos = pos;
      const formatter = opts.decimalsFormat;
      this._labelLatVal.innerHTML = formatter(pos.lat);
      this._labelLngVal.innerHTML = formatter(pos.lng);
    }
  },

  _updateMarker: function (evt) {
    let pos = evt.latlng;
    let opts = this.options;
    if (this._marker === null) {
      const Marker = opts.markerType;
      const options = opts.markerProps;
      this._marker = new Marker(pos, options).addTo(this._map);
      this._marker.on(
        "click",
        function (evt) {
          L.DomEvent.stopPropagation(evt);
          this._marker.remove();
          this._marker = null;
        },
        this
      );
    } else {
      this._marker.setLatLng(pos);
    }

    const formatter = opts.decimalsFormat;
    let latStr = formatter(pos.lat);
    let lngStr = formatter(pos.lng);

    let popStr = [
      `<span>${opts.labelHeadLat} ${latStr}</span>`,
      `<span>${opts.labelHeadLng} ${lngStr}</span>`
    ];
    if (!opts.useLatLngOrder) {
      popStr = popStr.reverse();
    }
    this._marker
      .bindPopup(
        `<span class="leaflet-control-coordinates-popup">${popStr[0]}${popStr[1]}</span>`
      )
      .openPopup();
  },

  _switchUI: function (evt) {
    L.DomEvent.stopPropagation(evt);
    console.debug(evt);
    if (!this._inputMode) {
      // on
      let map = this._map;
      let pos = this._currentPos;
      if (this._marker) {
        pos = this._marker.getLatLng();
      }
      let inputLat = this._createInput(this._labelLatVal, pos.lat);
      let inputLng = this._createInput(this._labelLngVal, pos.lng);
      const formatter = this.options.decimalsFormat;
      this._wrapInput = function () {
        return new L.LatLng(
          formatter(inputLat.value),
          formatter(inputLng.value)
        );
      };
      this._inputMode = true;
      map.off("mousemove", this._update, this);
      map.off("click", this._updateMarker, this);
      map.on("click", this._recoverUI, this);
      // L.DomEvent.on(this._container, "mouseleave", this._recoverUI, this);
    }
  },

  _recoverUI: function (evt) {
    L.DomEvent.stopPropagation(evt);
    if (this._inputMode) {
      let map = this._map;
      // L.DomEvent.off(this._container, "mouseleave", this._recoverUI, this);
      map.off("click", this._recoverUI, this);
      this._inputMode = false;
      map.on("mousemove", this._update, this);
      map.on("click", this._updateMarker, this);
      this._wrapInput = null;
      this._update(evt);
    }
  },

  _createInput: function (container, value) {
    container.innerHTML = "";
    let input = L.DomUtil.create(
      "input",
      "leaflet-control-coordinates-label-input",
      container
    );
    input.type = "number";
    input.value = value;
    L.DomEvent.disableClickPropagation(input);
    L.DomEvent.on(
      input,
      "change",
      function (evt) {
        if (this._wrapInput instanceof Function) {
          evt.latlng = this._wrapInput();
          this._updateMarker(evt);
        }
      },
      this
    );
    return input;
  }
});

//constructor registration
L.control.coordinates = function (options) {
  return new L.Control.Coordinates(options);
};

//map init hook
L.Map.mergeOptions({
  coordinateControl: false
});

L.Map.addInitHook(function () {
  if (this.options.coordinateControl) {
    this.coordinateControl = new L.Control.Coordinates();
    this.addControl(this.coordinateControl);
  }
});

export class CoordinatesControl extends L.Control.CoordinatesControl {}
