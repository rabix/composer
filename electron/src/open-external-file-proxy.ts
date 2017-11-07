const magnetLinks: Function[] = [];
const filePaths: Function[] = [];

export function onMagnetLinkOpen(callback) {
    magnetLinks.push(callback);
}

export function onFilePathOpen(callback) {
    filePaths.push(callback);
}

export function passMagnetLink(url) {
    magnetLinks.forEach(callback => {
        if (typeof callback === "function") {
            callback(url);
        }
    });
}

export function passFilePath(path) {
    filePaths.forEach(callback => {
        if (typeof callback === "function") {
            callback(path);
        }
    });
}
