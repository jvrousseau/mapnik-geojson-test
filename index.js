var Promise = require('bluebird'),
    abaculus = Promise.promisify(require('abaculus')),
    path = require('path'),
    mapnik = require('mapnik'),
    mercator = new(require('sphericalmercator')),
    path = require('path'),
    fs = require('fs'),
    congif_path = path.normalize(__dirname + '/layers.xml');

mapnik.register_datasource(path.join(mapnik.settings.paths.input_plugins, 'shape.input'));
mapnik.register_datasource(path.join(mapnik.settings.paths.input_plugins, 'gdal.input'));
mapnik.register_datasource(path.join(mapnik.settings.paths.input_plugins, 'ogr.input'));

function getGeoJSONImageTile(vtile) {
    'use strict';
    return function (z, x, y, callback) {
        var map = new mapnik.Map(256, 256),
            bbox = mercator.bbox(x, y, z, false, 'WGS84');
        map.load(congif_path, function (err, map) {
            map.extent = bbox;
            vtile.render(map, new mapnik.Image(256, 256), function (err, image) {
                image.encode('png32', function (error, buffer) {
                    callback(error, buffer, null);
                });
            })
        });
    };
}

function generateGeoJsonImage(options) {
    'use strict';
    var vtile = new mapnik.VectorTile(0, 0, 0),
        params;
    vtile.addGeoJSON(JSON.stringify(options.geojson), "layer-name");
    params = {
        zoom: options.zoom,
        scale: 1,
        center: {
            x: options.center_lng,
            y: options.center_lat,
            w: options.width,
            h: options.height
        },
        format: options.format,
        getTile: getGeoJSONImageTile(vtile)
    };
    return abaculus(params);
};

var options = {
    center_lat: 36.166,
    center_lng: -92.846,
    zoom: 6,
    width: 640,
    height: 480,
    format: 'png',
    quality: 256,
    'geojson': {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [-92.7685546875,
                            37.28279464911045
                        ],
                        [-95.020751953125,
                            37.75334401310656
                        ],
                        [-95.657958984375,
                            36.87962060502676
                        ],
                        [-96.17431640625,
                            35.77325759103725
                        ],
                        [-96.328125,
                            34.66032236481892
                        ],
                        [-94.7900390625,
                            33.38558626887102
                        ],
                        [-91.856689453125,
                            33.284619968887675
                        ],
                        [-94.33959960937499,
                            34.443158674505796
                        ],
                        [-95.130615234375,
                            35.67514743608467
                        ],
                        [-94.317626953125,
                            36.712467243386264
                        ],
                        [-92.384033203125,
                            36.74768773190056
                        ],
                        [-91.23046875,
                            36.049098959065645
                        ],
                        [-90.37353515625,
                            35.15584570226544
                        ],
                        [-90.06591796875,
                            35.737595151747826
                        ],
                        [-90.692138671875,
                            36.82687474287728
                        ],
                        [-92.032470703125,
                            37.43125050179356
                        ],
                        [-92.7685546875,
                            37.28279464911045
                        ]
                    ]
                ]
            }
        }]
    }
};

generateGeoJsonImage(options).then(function (image) {
    fs.writeFileSync('image.png', image[0]);
}).
catch (function (error) {
    console.error(error);
});
