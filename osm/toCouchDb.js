var db = require("../db"),
    Parser = require("./parser"),
    events = require("events"),
    _ = require("underscore");

function toCouchDb(input, db, callback) {
    var comingIn = 0,
        landed = 0,
        emitter = new events.EventEmitter();

    function saveDoc (doc) {
        comingIn++;
        db.insert(doc, doc.id, function (err, response) {
            if (err) { callback(err); }
            landed++;
            if (landed === comingIn) {
                emitter.emit("finishedLoading");
            }
        });
    }
    
    this.loader = new Parser();
    this.loader.on("featureReady", saveDoc);
    this.loader.on("nodeReady", saveDoc);
    this.loader.on("error", function (err) {
        console.log(err);
        callback(err);
    });
    
    emitter.on("finishedLoading", function () {
        callback(null);
    });
    
    if (_.isArray(input)) {
        this.loader.loadBbox(input);
    } else {
        this.loader.load(input);
    }
}

module.exports = toCouchDb;