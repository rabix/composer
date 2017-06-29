import {RecentAppTab} from "./recent-app-tab";

export class RepositoryType {
    activeTab: { tabID: string; activationTime: number; };

    expandedNodes: string[] = [];

    openTabs: Object[] = [];

    recentApps: RecentAppTab[] = [];

    appMeta: {
        [path: string]: {
            workingDirectory?: string,
            jobFilePath?: string
        }
    } = {};

}
