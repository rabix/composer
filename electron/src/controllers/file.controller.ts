import fsController = require("./fs.controller");

function isLocalFile(path) {
    return path.startsWith("/");
}

function isURL(path) {
    return path.startsWith("http");
}

export function get(filePath, callback) {
    /**
     * If this is a local file, we can just try to read it and return the content
     */
    if (isLocalFile(filePath)) {
        return fsController.readFileContent(filePath, callback);
    }
}
