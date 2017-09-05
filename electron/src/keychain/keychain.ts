const keytar  = require("keytar");
const appName = require("electron").app.getName();

export function get(credentialsID: string): Promise<string> {
    return keytar.getPassword(appName, credentialsID);
}

export function set(credentialsID: string, token: string): Promise<void> {
    return keytar.setPassword(appName, credentialsID, token);
}

export function remove(credentialsID: string): Promise<boolean> {
    return keytar.deletePassword(appName, credentialsID);
}
