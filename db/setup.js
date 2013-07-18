var fs = require("fs"),
    path = require("path"),
    nano = require("nano"),
    _ = require("underscore");

/*

How to use this module:

require("./db/setup")(function (err, dbs) {
    dbs.osmcache; // Cached features from OpenStreetMap
    dbs.routes;   // Trail "route" descriptions
    dbs.segments; // Trail "segment" descriptions
});

*/


function getDbs(couchdb, callback) {
    callback(null, {
        osmcache: couchdb.use("osmcache"),
        routes: couchdb.use("routes"),
        segments: couchdb.use("segments")
    });
}

module.exports = function setupDbs(callback) {
    var configPath = path.resolve(__dirname, "../configuration.json");
    
    callback = callback || function () {};
    
    fs.readFile(configPath, function (err, data) {
        if (err) { callback(err); return;  }
        var config = JSON.parse(data);
        
        try { var couch = nano(config.couchUrl); }
        catch(err) { callback(err); return;  }
        
        var required = ["osmcache", "routes", "segments"];
        
        function dbCheck(i) {
            if (i < required.length) {
                couch.db.create(required[i], function (err, body) {
                    if (err && err.error != "file_exists") { callback(err); return;  }
                    dbCheck(i + 1);
                });
            } else {
                getDbs(couch, callback);
            }
        }
        
        dbCheck(0);
        
    });
};


