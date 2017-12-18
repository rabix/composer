import * as Yaml from "js-yaml";

export function stringifyObject(object: Object, format: "json" | "yaml") {
    if (format === "json") {
        return JSON.stringify(object, null, 4);
    }

    const yamled = Yaml.safeDump(object);

    // Handle the bug with js-yaml where an empty object would be serialized as "{}" (yaml should not do that)
    if (yamled === "{}\n") {
        return "";
    }

    return yamled;
}
