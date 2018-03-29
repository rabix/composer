const path = require("path");

export function ensureAbsolutePaths(rootPath: string, job: Object): Object {

    return Object.keys(job).reduce((acc, key) => {
        return Object.assign(acc, {[key]: deepEnsureAbsolutePaths(job[key], rootPath)});
    }, {});
}

function deepEnsureAbsolutePaths(entry, rootPath) {
    if (Array.isArray(entry)) {
        return entry.map(value => deepEnsureAbsolutePaths(value, rootPath));
    } else if (Object.prototype.isPrototypeOf(entry)) {

        if (!isFileOrDir(entry)) {
            return Object.keys(entry).reduce((acc, key) =>
                Object.assign(acc, {[key]: deepEnsureAbsolutePaths(entry[key], rootPath)}), {}
            );
        }

        const updated = {...entry};
        if (updated.path) {
            updated.path = path.resolve(rootPath, updated.path);
        }

        if (Array.isArray(updated.secondaryFiles)) {
            updated.secondaryFiles = updated.secondaryFiles.map(el =>
                path.normalize(rootPath + path.sep + el.path)
            );
        }
        return updated;
    }

    return entry;
}

function isFileOrDir(entry): boolean {
    return entry && (entry.class === "File" || entry.class === "Directory") && typeof entry.path === "string";
}

function isAbsolutePath(p: string) {
    return p.startsWith("/") || (/^[a-z]:\\.+$/i).test(p);
}


