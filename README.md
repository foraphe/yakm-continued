# YAKM-Continued

The continued version of [Minecraft-JourneyMap-Explorer](https://github.com/wfjsw/Minecraft-JourneyMap-Explorer), a standalone Minecraft world map tool built with leaflet.

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

`settings.json`:
```
{
    "world": {
        "world_name": "path/to/info.json"
        ...
    },
    "default": "default_world_name"
}
```

`info.json` should be a JSON object with the following contents:
|        Key         |   Type   | Default                        |     Value                                                                                       |
|--------------------|----------|--------------------------------|-------------------------------------------------------------------------------------------------|
|z_original          |Number    |Required                        |scale level for full resolution tiles                                                            |
|z_maxscale          |Number    |Required                        |scale for highest scale tiles                                                                    |
|z_initial           |Number    |`(z_original + z_maxscale)/2`   |default zoom level                                                                               |
|offset              |Array     |Required                        |two numbers, representing offset for X and Y axis                                                |
|bounds              |Array     |Required                        |two array each with two numbers for the topleft and bottom-right corner of the map boundary      |
|tile_size           |Number    |Required                        |size in pixels of each tile file                                                                 |
|attribution         |String    |Required                        |Copyright (or other string) displayed on the map                                                 |
|preview             |Array     |Required                        |Default center coordinates when opening the map                                                  |
|tiles_list          |String    |Required                        |path to tiles.json (see below for details)                                                       |
|markers             |String    |Required                        |path to markers.json (see below for details)                                                     |

An example: 
```
{
  "z_original": 5,
  "z_maxscale": 0,
  "offset": [0, 0],
  "bounds": [
    [-5000, -5000],
    [5000, 5000]
  ],
  "tile_size": 256,
  "attribution": "&copy; 2023 Example",
  "preview": [0, 0],
  "tiles_list": "/static/data/world/tiles.json",
  "markers": "/static/data/world/markers.json"
}

```

`tiles.json` is the file in which tile file URLs are saved, an example is as follows: 
```
{
    "5,-1,5": { //zoom, x, z
        "url": "https://example.com/5,-1,5.png" // URL of the tile file
        "mtime": 1675004857823 // Timestamp, not really used
    },
    ...
}
```

`markers.json` contains an array of markers (waypoints), an example is as follows: 
```
[
    {
        "x": -12,
        "z": 463,
        "title": "A Point in the world",
        "description": "just a waypoint",
        "category": "world"
    }
]
```