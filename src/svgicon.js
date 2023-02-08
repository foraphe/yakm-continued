import L from 'leaflet';

const svgDataCache = {}

function loadSVG(url, callback) {
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

const defaultColor = "#66FFCC";

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

    createIcon(oldIcon) {
		const div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
		    options = this.options;
        
        const _color = options.color || defaultColor;
		loadSVG(options.iconUrl, function(html) {
            div.innerHTML = html;
            let svg = div.querySelector("svg");
            console.debug(svg);
            svg.querySelectorAll("path").forEach(function(path) {
                path.style.stroke = _color;
            });
        });

		if (options.bgPos) {
			const bgPos = point(options.bgPos);
			div.style.backgroundPosition = `${-bgPos.x}px ${-bgPos.y}px`;
		}
		this._setIconStyles(div, 'icon');

		return div;
	},

	createShadow() {
		return null;
	}

});

export class SVGIcon extends L.SVGIcon { }