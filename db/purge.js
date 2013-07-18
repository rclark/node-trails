/*
    Purge all records from the database tables.

    How to use this module:
    
    require("./db/purge")(function (err) {
        return true; // If there's no error, then it worked!
    });

*/

var _ = require("underscore");

module.exports = function purgeDbs(callback) {
    // Make sure a callback exists
    callback = callback || function () {};
    
    require("./setup")(function (err, dbs) {
        if (err) { callback(err); return; }
        
        // Get the database names that were returned from setup
        var dbNames = _.keys(dbs);
        
        // Define a function to recursively purge databases
        function purgeDb(i) {
            // If we aren't done yet...
            if (i < dbNames.length) {
                // Get this database's name
                var thisDb = dbs[dbNames[i]];
                
                // List all the docs in the database
                thisDb.list(function (err, body) {
                    if (err) { callback(err); return;  }
                    
                    // If there are no records, then there's nothing to do
                    if (body.rows.length === 0) { callback(); return;  }
                    
                    // Otherwise generate an array to submit to Couch to delete records
                    docs = _.map(body.rows, function (doc) {
                        return { _id: doc._id, _rev: doc._rev, _deleted: true };
                    });
                    
                    // Perform a bulk update
                    thisDb.bulk(docs, function (err, response) {
                        if (err) { callback(err); return;  }
                        
                        // Iterate to the next database
                        purgeDb(i + 1);
                    });
                });
            } else {
                // We've made it all the way through, so return
                callback();
            }
        }
        
        // Start the recursive process through databases
        purgeDb(0);
    });
};