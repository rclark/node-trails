var expat = require("node-expat"),
    request = require("request"),
    events = require("events"),
    _ = require("underscore");

function Parser() {
    var self = this;
    
    // Setup this object's event emitter
    events.EventEmitter.call(this);
    
    // Setup an XML stream parser
    this.parser = new expat.Parser("UTF-8");
    this.currentFeature = null;
    this.nodes = {};
    
    // Listen to parser events -- When a new element starts...
    this.parser.on("startElement", function (name, attrs) {        
        switch (name) {
        case "node":
            // Cache the nodes to assemble features with later
            var nodeInfo = {
                type: "Feature",
                id: attrs.id, 
                properties: {uid: attrs.uid},
                geometry: {type: "Point", coordinates: [attrs.lon, attrs.lat]}
            };
            
            self.nodes[attrs.id] = nodeInfo;
                
            // Signal that a node is ready
            self.emit("nodeReady", nodeInfo);
            break;
                
        case "way":
            // Begin assembling a feature
            self.currentFeature = {
                type: "Feature",
                id: attrs.id,
                properties: {uid: attrs.uid},
                geometry: {type: "", coordinates: []}
            };
            break;
                
        case "nd":
            // These are references to the nodes that make up a feature's geometry
            self.currentFeature.geometry.coordinates.push(self.nodes[attrs.ref].geometry.coordinates);
            break;
                
        case "tag":
            // These are properties of the feature
            if (self.currentFeature) {
                self.currentFeature.properties[attrs.k] = attrs.v;
            }
            break;
        }
    });

    // When an element ends...
    this.parser.on("endElement", function (name) {
        // Only do anything if it is a way
        if (name === "way") {            
            // If the last coord is identical to the first, then it is a Polygon...
            var geom = self.currentFeature.geometry,
                last = geom.coordinates.length - 1;
            if (geom.coordinates[0] === geom.coordinates[last]) {
                // ...and the "ring" needs to be wrapped in another pair of brackets
                geom.coordinates = [geom.coordinates];
                geom.type = "Polygon";
            } else {
            // Otherwise this is a LineString
                geom.type = "LineString";
            }
            
            // Signal that a feature is ready
            self.emit("featureReady", _.clone(self.currentFeature));
        }
    });
    
    // When we're all finished with the incoming data
    this.parser.on("end", function () {
        // Signal that we're finished
        self.emit("finishedParsing");
        
        // Clear caches
        self.nodes = {};
        self.currentFeature = null;
    });
    
    this.parser.on("error", function (err) {
        self.emit("error", err);
    });
}

Parser.prototype.__proto__ = events.EventEmitter.prototype;

Parser.prototype.load = function (osmStream) {
    // Just pipe the stream into the parser
    osmStream.pipe(this.parser);
}

Parser.prototype.loadBbox = function (bbox) {
    // Check the size of the bbox. OSM won't take it if its too big
    if ((bbox[2] - bbox[0]) * (bbox[3] - bbox[1]) > 0.25) {
        throw new Error("The bounding box was too large for an OSM API request");
        return;        
    }
        
    // Request OSM data by BBOX and run it through the parser
    var url = "http://api.openstreetmap.org/api/0.6/map?bbox=" + bbox.join(",");    
    request(url).pipe(this.parser);
}

module.exports = Parser;