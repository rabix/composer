const fs = require("fs");
const path = require("path");

module.exports = {
    get: (accelerator, callback) => {
        proxy.on(accelerator, (menu) => {
            callback(null, menu);
        });
    },

    put: (path, data, callback) => {

    }
};
