import * as settings from "electron-settings";
export type ProfileCredentialEntry = {
    label: string,
    profile: string,
    url?: string,
    token?: string,
    connected?: boolean
}

export type ProfileCredentials = ProfileCredentialEntry[];
const defaults = {
    /**
     * Array of objects
     */
    credentials: [
        {
            label: "Seven Bridges",
            profile: "default",
            url: "https://igor.sbgenomics.com",
            sessionID: null,
            token: "",
        } as ProfileCredentialEntry
    ] as ProfileCredentials,
    lastScanTime: 0,
    /**
     * Which of your folders are expanded
     * @type string[] tree node ids
     */
    expandedNodes: [],
    localFolders: [],
    dataCache: {}
};

export function boot(): Promise<any> {
    settings.defaults(defaults);
    return settings.applyDefaults();
}

