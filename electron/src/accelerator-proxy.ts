const registry: { [hash: string]: Function[] } = {};

module.exports = {

    on: (accelerator, callback) => {
        if (!registry[accelerator]) {
            registry[accelerator] = [];
        }
        registry[accelerator].push(callback);
    },

    pass: (menu, browser, event) => {
        if (Array.isArray(registry[menu.accelerator])) {
            registry[menu.accelerator].forEach(callback => {
                if (typeof callback === "function") {
                    callback(menu, browser, event);
                }
            });
        }
    }
};
