var Promise = require('bluebird'),
    mapnik = require('mapnik'),
    mercator = new(require('sphericalmercator')),
    mapnikify = require('geojson-mapnikify'),
    viewport = require('geo-viewport'),
    fs = require('fs');

mapnik.register_default_input_plugins();

function generateGeoJsonImage(options, callback) {
    'use strict';
    var map = new mapnik.Map(options.width, options.height),
        image = new mapnik.Image(map.width, map.height),
        bbox = viewport.bounds([options.center_lng, options.center_lat], options.zoom, [map.width, map.height]);
    bbox = mercator.convert(bbox, '900913');
    mapnikify(options.geojson, false, function (err, xml) {
        if (err) return cb(err);
        map.fromString(xml, {
            strict: true
        }, function (err, map) {
            if (err) return cb(err);
            map.zoomAll();
            map.extent = bbox;
            map.render(image, function (err, image) {
                if (err) return cb(err);
                image.encode('png32', function (err, buffer) {
                    callback(err, buffer);
                })
            })
        });
    });
}


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
            "properties": {
                "stroke": "070707",
                "fill": "#32CD32"
            },
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

generateGeoJsonImage(options, function (err, image) {
    if (err) throw err;
    fs.writeFileSync('image.png', image);
});
