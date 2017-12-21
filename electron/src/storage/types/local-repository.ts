import {User} from "../../sbg-api-client/interfaces";
import {ExecutorConfig} from "./executor-config";
import {RepositoryType} from "./repository-type";
import {TabData} from "./tab-data-interface";
import {defaultExecutionOutputDirectory} from "../../controllers/execution-results.controller";

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
        path: "",
        choice: "bundled",
        outDir: defaultExecutionOutputDirectory
    };

    openTabs: TabData<any> [] = [{
        id: "?welcome",
        label: "Welcome",
        type: "Welcome"
    }];

    ignoredUpdateVersion = null;
}
