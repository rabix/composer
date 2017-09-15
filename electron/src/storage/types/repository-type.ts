import {RecentAppTab} from "./recent-app-tab";
import {AppMeta} from "./app-meta";

export class RepositoryType {
    activeTab: { tabID: string; activationTime: number; };

    expandedNodes: string[] = [];

    openTabs: Object[] = [];

    recentApps: RecentAppTab[] = [];

    appMeta: AppMeta = {};

}
