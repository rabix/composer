import fsController = require("./fs.controller");
import settings = require("electron-settings");

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

    /**
     * If it's an url, we need to check first if we can fetch it
     */
    if (isURL) {

    }
}
