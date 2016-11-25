const proxy = require("../accelerator-proxy");

module.exports = {
    register: (accelerator, callback) => {
        proxy.on(accelerator, (menu) => {
            callback(null, menu);
        });
    }
};