var vows = require("vows"),
    assert = require("assert"),
    _ = require("underscore"),
    db = require("../db");

function dbsAlright(err, dbs) {
    assert.isNull(err);
    assert.isObject(dbs);
    assert.isObject(dbs.osmcache);
    assert.isObject(dbs.routes);
    assert.isObject(dbs.segments);
}

vows.describe("Database Manipulation").addBatch({
    "The database setup function": {
        topic: function () {
            db.setup(this.callback);
        },
        "returns an object and no errors": function (err, dbs) {
            assert.isNull(err);
            assert.isObject(dbs);
        },
        "returns all three database connections": dbsAlright,
        "can be called twice": function (err, dbs) {
            db.setup(dbsAlright);
        }
    },
    "The database purge function": {
        topic: function () {
            var callback = this.callback;
            db.setup(function (err, dbs) {
                if (err) { return err; }
                dbs.osmcache.insert({a: "test"}, function (err, body) {
                    if (err) { return err; }
                    db.purge(callback);
                });
            });
        },
        "does not return an error": function (err) {
            assert.isTrue(!err);
        },
        "leaves the databases empty": function (err) {
            assert.isTrue(!err);
            db.setup(function (err, dbs) {
                dbsAlright(err, dbs);
                ["osmcache", "routes", "segments"].forEach(function (dbName) {
                    dbs[dbName].list(function (err, body) {
                        assert.isNull(err);
                        assert.equal(body.rows.length, 0);
                    });
                });
            });
        }
    }
}).export(module);