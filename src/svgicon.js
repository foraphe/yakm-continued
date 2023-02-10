import L from 'leaflet';

const svgDataCache = {}

function loadSVG(url, callback /* : (svgText: String) => void */) {
    let c = svgDataCache[url];
    if(c) {
        callback(c);
    } else {
        fetch(url).then(resp => resp.text()).then(function(text) {
            svgDataCache[url] = text;
            callback(text);
        });
    }
}

L.SVGIcon = L.Icon.extend({

    options: {

        color: null,

		// @section
		// @aka SVGIcon options
		iconSize: [24, 24], // also can be set through CSS

		// iconAnchor: (Point),
		// popupAnchor: (Point),

		// @option bgPos: Point = [0, 0]
		// Optional relative position of the background, in pixels
		bgPos: null,

		className: 'leaflet-svg-icon'
	},

	initialize(options) {
		L.Util.setOptions(this, options);
		this._divRef = null;
	},

    createIcon(oldIcon) {
		const div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
		    options = this.options;
        const _color = options.color;
		let sizeOption = options.iconSize;
		if (typeof sizeOption === 'number') {
			sizeOption = [sizeOption, sizeOption];
		}
		const size = L.point(sizeOption);
		loadSVG(options.iconUrl, function(html) {
            div.innerHTML = html;
            let svg = div.querySelector("svg");
			svg.setAttribute("width", String(size.x));
			svg.setAttribute("height", String(size.y));
			if(_color) {
				svg.querySelectorAll("path").forEach(function(path) {
					path.style.stroke = _color;
				});
			}
			console.debug(svg);
        });

		if (options.bgPos) {
			const bgPos = point(options.bgPos);
			div.style.backgroundPosition = `${-bgPos.x}px ${-bgPos.y}px`;
		}
		this._setIconStyles(div, 'icon');
		this._divRef = new WeakRef(div);
		return div;
	},

	createShadow() {
		return null;
	},

	updateSize(scale) {
		if(this._divRef) {
			const div = this._divRef.deref();
			if(div) {
				const options = this.options;
				let sizeOption = options.iconSize;
				if (typeof sizeOption === 'number') {
					sizeOption = [sizeOption, sizeOption];
				}
				const size = L.point(sizeOption);
				const sizeNew = new L.Point(Math.ceil(size.x * scale), Math.ceil(size.y * scale));
				const anchorNew = L.point(options.iconAnchor && L.point(options.iconAnchor).divideBy(size.x / sizeNew.x) || size && size.divideBy(2, true));
				console.debug(sizeNew, anchorNew);
				let svg = div.querySelector("svg");
				svg.setAttribute("width", String(sizeNew.x));
				svg.setAttribute("height", String(sizeNew.y));

				if (anchorNew) {
					div.style.marginLeft = `${-anchorNew.x}px`;
					div.style.marginTop  = `${-anchorNew.y}px`;
				}

				if (size) {
					div.style.width  = `${sizeNew.x}px`;
					div.style.height = `${sizeNew.y}px`;
				}

			} else {
				this._divRef = null;
			}
		}
	}
});

export class SVGIcon extends L.SVGIcon { }