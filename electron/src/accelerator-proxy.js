const registry = {};

module.exports = {

    on: (accelerator, callback) => {
        registry[accelerator] = callback;
    },

    pass: (menu, browser, event) => {
        if (typeof registry[menu.accelerator] === "function") {
            registry[menu.accelerator](menu, browser, event);
        }
    }
};