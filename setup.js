var fs = require("fs"),
    defaultConfig = {
        "couchUrl": "http://127.0.0.1:5984"
    };

// Eventually accept user-input

fs.writeFile("configuration.json", JSON.stringify(defaultConfig));