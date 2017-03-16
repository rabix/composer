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
            token: "",
        } as ProfileCredentialEntry
    ] as ProfileCredentials,
    lastScanTime: 0,
    workspace: {

        projects: [],

        /**
         * Which of your local folders are in your workspace
         * @type string[] absolute paths
         */
        localFolders: [],
        /**
         * Which of your folders are expanded
         * @type string[] tree node ids
         */
        expandedNodes: [],
    },

    dataCache: {}
};

export function boot(): Promise<any> {
    settings.defaults(defaults);
    return settings.applyDefaults();
}
