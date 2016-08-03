import {DECORATOR_KEY_ASSIGNABLE} from "../decorators";

export module Component {
    /**
     * Assigns values to @assignable properties of component instances
     */
    export function assign(properties: Object, componentInstance: Object) {

        const metadata = Reflect.getMetadata(DECORATOR_KEY_ASSIGNABLE, Reflect.getPrototypeOf(componentInstance));

        if (!metadata) {
            return console.error(
                "Trying to assign properties to a component without assignable metadata",
                properties,
                componentInstance);
        }

        for (let key in properties) {
            if (!metadata.hasOwnProperty(key)) {
                console.error("Trying to assign unassignable property", key, componentInstance);
                continue;
            }

            const keyMeta = metadata[key];
            const method  = keyMeta["method"];
            if (method) {
                (componentInstance[key][method] as Function)(properties[key]);
            } else {
                componentInstance[key] = properties[key];
            }
        }
    }
}
