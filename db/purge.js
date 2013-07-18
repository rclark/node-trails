var _ = require("underscore");

/*

How to use this module:

require("./db/purge")(function (err) {
    // If there's no error, then it worked!
});

*/

module.exports = function purgeDbs(callback) {
    require("./setup")(function (err, dbs) {
        if (err) { callback(err); }
        
        var dbNames = _.keys(dbs);
        
        function purgeDb(i) {
            if (i < dbNames.length) {
                var thisDb = dbs[dbNames[i]];
                thisDb.list(function (err, body) {
                    if (err) { callback(err); }
                    
                    if (body.rows.length === 0) { callback(); }
                    
                    docs = _.map(body.rows, function (doc) {
                        return { _id: doc._id, _rev: doc._rev, _deleted: true };
                    });
                    console.log(docs);
                    thisDb.bulk(docs, function (err, response) {
                        if (err) { callback(err); }
                        purgeDb(i + 1);
                    });
                });
            } else {
                callback();
            }
        }
        
        purgeDb(0);
    });
};