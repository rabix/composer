import {DECORATOR_KEY_ASSIGNABLE} from "../decorators";

/**
 * Assigns values to @assignable properties of component instances
 */
export function refAssign(componentInstance: Object, ...propertyGroups: Object[]) {

    const metadata = Reflect.getMetadata(DECORATOR_KEY_ASSIGNABLE, Object.getPrototypeOf(componentInstance));

    if (!metadata) {
        return console.warn(
            "Trying to assign properties to a component without assignable metadata",
            componentInstance
        );
    }

    propertyGroups.forEach(properties => {
        for (let key in properties) {
            if (!metadata.hasOwnProperty(key)) {
                console.warn("Trying to assign unassignable property", key, componentInstance);
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
    });
}
