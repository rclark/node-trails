/*
    Sets up the CouchDB databases that this application needs.
    
    How to use this module:
    
    require("./db/setup")(function (err, dbs) {
        dbs.osmcache; // Cached features from OpenStreetMap
        dbs.routes;   // Trail "route" descriptions
        dbs.segments; // Trail "segment" descriptions
    });

*/

var fs = require("fs"),
    path = require("path"),
    nano = require("nano"),
    _ = require("underscore"),
    databases = ["osmcache", "routes", "segments"];

module.exports = function setupDbs(callback) {
    // Find the path to the configuration file
    var configPath = path.resolve(__dirname, "../configuration.json");
    
    // If no callback is given, generate a generic one
    callback = callback || function () {};
    
    // Read the configuration file
    fs.readFile(configPath, function (err, data) {
        if (err) { callback(err); return;  }
        
        // Parse the configuration file
        var config = JSON.parse(data);
        
        // Connect to CouchDB. Bail if the URL is bad
        try { var couch = nano(config.couchUrl); }
        catch(err) { callback(err); return;  }
        
        // Recursive function to perform asynchronous creations
        function dbCheck(i) {
            // Check if we've gone far enough yet
            if (i < databases.length) {
                // Create this database
                couch.db.create(databases[i], function (err, body) {
                    // If there's an error that is not "file_exists", bail
                    if (err && err.error != "file_exists") { callback(err); return;  }
                    // Iterate -- move on to the next database
                    dbCheck(i + 1);
                });
            } else {
                // Once all databases are created, get all the database references
                var result = {}
                databases.forEach(function(dbName) {
                    // Try to reference each database, bail if there's any failure
                    try { result[dbName] = couch.use(dbName); }
                    catch(err) { callback(err); return; }
                });
                
                // Fire the callback returning the databases
                callback(null, result);
            }
        }
        
        // Start the recursive creation calls
        dbCheck(0); 
    });
};


