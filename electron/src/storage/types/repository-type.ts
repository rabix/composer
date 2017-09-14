import {RecentAppTab} from "./recent-app-tab";
import {AppMetadata} from "./local-repository";

export class RepositoryType {
    activeTab: { tabID: string; activationTime: number; };

    expandedNodes: string[] = [];

    openTabs: Object[] = [];

    recentApps: RecentAppTab[] = [];

    appMeta: { [path: string]: AppMetadata } = {};

}
