const path = require("path");

export function ensureAbsolutePaths(rootPath: string, job: Object): Object {
    const parsed = {...job};

    Object.keys(parsed).forEach(key => {
        const val = parsed[key];

        const isFileOrDir = val && val.class && ~["File", "Directory"].indexOf(val.class);

        if (isFileOrDir) {
            if (val.path && !isAbsolutePath(val.path)) {
                val.path = path.normalize(rootPath + path.sep + val.path);
            }

            if (Array.isArray(val.secondaryFiles)) {
                val.secondaryFiles = val.secondaryFiles.map(el => path.normalize(rootPath + path.sep + el.path));
            }
        }
    });

    return parsed;
}

function isAbsolutePath(p: string) {
    return p.startsWith("/") || (/^[a-z]:\\.+$/i).test(p);
}


