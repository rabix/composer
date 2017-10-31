const registry: any [] = [];

export function on(callback) {
    registry.push(callback);
}

export function pass(url) {
    registry.forEach((callback) => {
        if (typeof callback === "function") {
            callback(url);
        }
    });
}
