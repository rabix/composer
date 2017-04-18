import * as acceleratorProxy from "../accelerator-proxy";

module.exports = {
    register: (accelerator, callback) => {
        acceleratorProxy.on(accelerator, (menu) => {
            callback(null, menu);
        });
    }
};
