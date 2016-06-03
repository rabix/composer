export class ObjectHelper {

    private static pathDelimiter = ".";

    /**
     * Adds a value to a nested path in an object
     *
     * @param target Target object to add properties to
     * @param path dot-delimited path, ex. "foo.bar.baz"
     * @param value value to add to the "baz" key
     */
    public static addProperty(target: Object, path: string[] | string, value: any): void {

        // Ensure that path is an array of path elements
        const path = typeof path === "string" ? path.split(ObjectHelper.pathDelimiter) : path;

        path.reduce((acc, curr, index, arr)=> {
            if (index === arr.length - 1) {
                return acc[curr] = value;
            }

            if (!acc.hasOwnProperty(curr)) {
                acc[curr] = {};
                return acc[curr];
            } else if (typeof acc[curr] === "object" && acc[curr] !== null) {
                return acc[curr];
            } else {
                throw new Error("Couldn't add a nested property to type " + typeof acc);
            }
        }, target);
    }

    /**
     * Overwrite enumerable properties of the target with the ones from the source object
     * @param target
     * @param source
     * @returns {Object}
     * @link ObjectHelper-addEnumerablesTest
     */
    public static addEnumerables(target: Object, source: Object): void {
        for (let key of Object.keys(source)) {
            if (target.propertyIsEnumerable(key)) {
                target[key] = source[key];
            }
        }
    }
}
