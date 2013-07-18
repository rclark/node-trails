/* 
    Write a configuration file for server-specifics like DB connection strings
*/

var fs = require("fs"),
    // Default configuration parameters
    defaultConfig = {
        "couchUrl": "http://127.0.0.1:5984"
    };

// Eventually I'll accept user-input

fs.writeFile("configuration.json", JSON.stringify(defaultConfig));