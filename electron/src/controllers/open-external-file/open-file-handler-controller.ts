import * as openExternalFileProxy from "../../open-external-file-proxy";

let filePaths: string [] = [];
let callbackRegistered = false;

module.exports = {
    register: (callback) => {
        openExternalFileProxy.onFilePathOpen((url) => {
            callback(null, url);
        });

        if (filePaths.length) {
            filePaths.forEach((path) => {
                callback(null, path);
            });

            filePaths = null;
        }

        callbackRegistered = true;
    },

    setLocalFilePath: (path: string) => {
        if (!callbackRegistered) {
            filePaths.push(path);
        }

        return path;
    },
};
