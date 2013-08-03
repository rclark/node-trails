var vows = require("vows"),
    assert = require("assert"),
    osm = require("../osm"),
    db = require("../db"),
    fs = require("fs");

vows.describe("OSM Loading").addBatch({
    "Parsing a test static file": {
        topic: function () {
            var p = new osm.Parser(),
                input = fs.createReadStream("test-data/demo.osm"),
                cb = this.callback,
                features = [],
                nodes = [];
            p.on("featureReady", function (feature) { features.push(feature); });
            p.on("nodeReady", function (node) { nodes.push(node); });
            p.on("finishedParsing", function () { cb(null, features, nodes); });
            p.load(input);
        },
        
        "produces the correct number of features": function (err, features, nodes) {
            assert.isDefined(features);
            assert.equal(features.length, 67);
        },
        
        "produces the correct number of nodes": function (err, features, nodes) {
            assert.isDefined(nodes);
            assert.equal(nodes.length, 1994);
        }
    },
    
    "Loading a test static file": {
        topic: function () {
            var cb = this.callback;
            db.purge(function (err) {
                db.setup(function (err, dbs) {
                    if (err) { throw err; }
                    var input = fs.createReadStream("test-data/demo.osm");
                    osm.toCouchDb(input, dbs.osmcache, function (err) {
                        if (err) { cb(err); return; }
                        dbs.osmcache.list(function (err, response) {
                            cb(err, response.rows.length);
                        });
                    });
                });
            });
        },
        
        "loads the correct number of features": function (err, recordCount) {
            assert.isTrue(!err);
            assert.equal(2061, recordCount);
        }
    }/*,
    
    "Loading from BBOX": {
        topic: function () {
            var cb = this.callback,
                bbox = [-111.01032257080078, 31.414701127170984, -110.98004608154295, 31.44749254518246];
            //db.purge(function (err) {
                db.setup(function (err, dbs) {
                    osm.toCouchDb(bbox, dbs.osmcache, function (err) {
                        if (err) { cb(err); return; }
                        dbs.osmcache.list(function (err, response) {
                            cb(err, response.rows.length);
                        });
                    });
                });
            //});
        },
        
        "loads the proper number of features": function (err, recordCount) {
            assert.isTrue(!err);
            assert.equal(2061, recordCount);
        }
    }*/
}).export(module);