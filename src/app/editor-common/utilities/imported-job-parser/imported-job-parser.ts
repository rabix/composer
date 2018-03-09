const {relative, isAbsolute, dirname, resolve} = require("path");

export function fixJobFilePaths(appPath: string, jobFilePath: string, job: any): any {
    if (!Object.prototype.isPrototypeOf(job) || Array.isArray(job)) {
        return job;
    }

    const replaced = {};

    Object.keys(job).forEach(inputID => {
        replaced[inputID] = deepReplacePaths(appPath, jobFilePath, job[inputID]);
    });

    return replaced;
}

function deepReplacePaths(appPath: string, jobPath: string, value: any): any {

    if (Array.isArray(value)) {
        return value.map(el => deepReplacePaths(appPath, jobPath, el));
    } else if (Object.prototype.isPrototypeOf(value)) {

        if (typeof value.path === "string" && (value.class === "File" || value.class === "Directory")) {
            return {...value, path: resolveFilePath(appPath, jobPath, value.path)};
        } else {
            return Object.keys(value).reduce((acc, key) => Object.assign(acc, {[key]: deepReplacePaths(appPath, jobPath, value[key])}), {});
        }
    }

    return value;
}

/**
 *
 * @param {string} appPath Absolute path of a file that converPath should be adapted to be relative to
 * @param {string} jobPath Absolute path of a file that the convertPath is relative to at the moment, but should not be
 * @param {string} targetPath Path to modify
 * @param {"File" | "Directory"} type
 * @returns {string}
 */
export function resolveFilePath(appPath: string, jobPath: string, targetPath: string): string {
    const isLocalFile = isAbsolute(appPath);

    // If a path being imported is an absolute path, don't change it
    if (isAbsolute(targetPath)) {
        return targetPath;
    }

    const jobDir         = dirname(jobPath);
    const targetAbsolute = resolve(jobDir, targetPath);

    if (isLocalFile) {
        const appDir = dirname(appPath);
        return relative(appDir, targetAbsolute);
    } else {
        return targetAbsolute;
    }

}
