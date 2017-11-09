import * as openExternalFileProxy from "../../open-external-file-proxy";

let deepLinkingURL;

module.exports = {
    register: (callback) => {
        openExternalFileProxy.onMagnetLinkOpen((url) => {
            callback(null, url);
        });

        if (deepLinkingURL) {
            callback(null, deepLinkingURL);
        }
    },

    setMagnetLinkData: (encoded: string) => {
        try {
            const decoded = (new Buffer(encoded, "base64")).toString();
            deepLinkingURL = JSON.parse(decoded);
        } catch (e) {
            deepLinkingURL = null;
        }

        return deepLinkingURL;
    }
};
