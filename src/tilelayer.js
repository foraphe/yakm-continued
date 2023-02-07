import L from "leaflet";

L.ListedTileLayer = L.TileLayer.extend({
  initialize: function (list, options) {
    this._list = list;

    options = L.Util.setOptions(this, options);

    // detecting retina displays, adjusting tileSize and zoom levels
    if (options.detectRetina && L.Browser.retina && options.maxZoom > 0) {
      options.tileSize = Math.floor(options.tileSize / 2);

      if (!options.zoomReverse) {
        options.zoomOffset++;
        options.maxZoom--;
      } else {
        options.zoomOffset--;
        options.minZoom++;
      }

      options.minZoom = Math.max(0, options.minZoom);
    }

    if (typeof options.subdomains === "string") {
      options.subdomains = options.subdomains.split("");
    }

    // for https://github.com/Leaflet/Leaflet/issues/137
    if (!L.Browser.android) {
      this.on("tileunload", this._onTileRemove);
    }
  },

  createTile: function (coords, done) {
    let x = coords.x;
    let y = coords.y;
    let zoom = this._getZoomForUrl();
    let key = `${zoom},${x},${y}`;

    let tile = document.createElement("img");

    const list = this._list;
    if (key in list) {
      L.DomEvent.on(
        tile,
        "load",
        L.Util.bind(this._tileOnLoad, this, done, tile)
      );
      L.DomEvent.on(
        tile,
        "error",
        L.Util.bind(this._tileOnError, this, done, tile)
      );

      if (this.options.crossOrigin || this.options.crossOrigin === "") {
        tile.crossOrigin =
          this.options.crossOrigin === true ? "" : this.options.crossOrigin;
      }

      /*
		 Alt tag is set to empty string to keep screen readers from reading URL and for compliance reasons
		 http://www.w3.org/TR/WCAG20-TECHS/H67
		*/
      tile.alt = "";

      /*
		 Set role="presentation" to force screen readers to ignore this
		 https://www.w3.org/TR/wai-aria/roles#textalternativecomputation
		*/
      tile.setAttribute("role", "presentation");

      tile.src = list[key].url;
    }

    return tile;
  },

  setUrl: null,

  getTileUrl: null
});

export class ListedTileLayer extends L.ListedTileLayer {}
