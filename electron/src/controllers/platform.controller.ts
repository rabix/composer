import settings = require("electron-settings");

export function fetchApp(profile, id, callback) {
    this.settings.get("credentials").then(credentials => {
        const requestedPlatform = credentials.find(c => c.profile === profile);
    }, err => {
        callback(err);
    })
}
