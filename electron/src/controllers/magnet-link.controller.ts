import * as magnetLinkProxy from "../magnet-link-proxy";

let magnetLinkData;

module.exports = {
    register: (callback) => {
        magnetLinkProxy.on((url) => {
            callback(null, url);
        });

        if (magnetLinkData) {
            callback(null, magnetLinkData);
        }
    },

    setMagnetLinkData: (encoded: string) => {
        const decoded = (new Buffer(encoded, "base64")).toString();

        try {
            magnetLinkData = JSON.parse(decoded);
        } catch (e) {
            magnetLinkData = null;
        }

        return magnetLinkData;
    }
};
