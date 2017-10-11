import {User} from "../../sbg-api-client/interfaces/user";
import {ExecutorConfig} from "./executor-config";
import {RepositoryType} from "./repository-type";
import {TabData} from "./tab-data-interface";

export interface CredentialsCache {
    id: string;
    user: Partial<User>;
    url: string;
    token: string;
}

export class LocalRepository extends RepositoryType {

    activeCredentials: CredentialsCache = null;

    credentials: CredentialsCache[] = [];

    localFolders: string[] = [];

    publicAppsGrouping: "toolkit" | "category" = "toolkit";

    selectedAppsPanel: "myApps" | "publicApps" = "myApps";

    sidebarHidden = false;

    executorConfig: ExecutorConfig = {
        path: ""
    };

    openTabs: TabData<any> [] = [{
        id: "?welcome",
        label: "Welcome",
        type: "Welcome"
    }];

    ignoredUpdateVersion = null;
}
