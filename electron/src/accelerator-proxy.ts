export class AcceleratorProxy {

    private registry: { [hash: string]: Function[] } = {};

    on(accelerator, callback) {
        if (!this.registry[accelerator]) {
            this.registry[accelerator] = [];
        }
        this.registry[accelerator].push(callback);
    }

    pass(menu, browser, event) {
        if (Array.isArray(this.registry[menu.accelerator])) {
            this.registry[menu.accelerator].forEach(callback => {
                if (typeof callback === "function") {
                    callback(menu, browser, event);
                }
            });
        }
    }
}
