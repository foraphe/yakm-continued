# YAKM-Continued

The continued version of (Minecraft-JourneyMap-Explorer)[https://github.com/wfjsw/Minecraft-JourneyMap-Explorer], a standalone Minecraft world map tool built on leaflet.

## Quick Start
Clone the repository, use `npm install` to install dependencies, and then use `npm run build` to pack the site.
You'll need the tile files and settings to display.
Create the static file directory as follows:
```
dist
    static:
        settings.json  
```
and put your map tiles any where you want.

for `settings.json`:
```
{
    "world": {
        "world_name": "path/to/info.json"
        ...
    },
    "default": "default_world_name"
}
```

`info.json` should be a JSON object with the following keys:
|        Name        |   Type   | Default                        |     value                                                                                       |
|--------------------|----------|--------------------------------|-------------------------------------------------------------------------------------------------|
|z_original          |Number    |Required                        |scale level for full resolution tiles                                                            |
|z_maxscale          |Number    |Required                        |scale for highest scale tiles                                                                    |
|z_initial           |Number    |`(z_original + z_maxscale)/2`   |default zoom level                                                                               |
|offset              |Array     |Required                        |two numbers, representing offset for X and Y axis                                                |
|bounds              |Array     |Required                        |two array each with two numbers for the topleft and bottom-right corner of the map boundary      |
|tile_size           |Number    |Required                        |size in pixels of each tile file                                                                 |
|attribution         |String    |Required                        |Copyright (or other string) displayed on the map                                                 |
|preview             |Array     |Required                        |?                                                                                                |
|tiles_list          |String    |Required                        |path to tiles.json                                                                               |
|markers             |String    |Required                        |path to markers.json                                                                             |

...todo