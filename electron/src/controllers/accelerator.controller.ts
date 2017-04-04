import {AcceleratorProxy} from "../accelerator-proxy";

const proxy = new AcceleratorProxy();
module.exports = {
    register: (accelerator, callback) => {
        proxy.on(accelerator, (menu) => {
            callback(null, menu);
        });
    }
};
