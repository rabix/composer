import {User} from "../../sbg-api-client/interfaces/user";
import {AppExecutionContext, ExecutorConfig} from "./executor-config";
import {RepositoryType} from "./repository-type";
import * as path from "path";

export interface CredentialsCache {
    id: string;
    user: Partial<User>;
    url: string;
    token: string;
}

export interface AppMetadata {
    executionConfig: AppExecutionContext,
}

export class LocalRepository extends RepositoryType {

    activeCredentials: CredentialsCache = null;

    credentials: CredentialsCache[] = [];

    localFolders: string[] = [];

    publicAppsGrouping: "toolkit" | "category" = "toolkit";

    selectedAppsPanel: "myApps" | "publicApps" = "myApps";

    sidebarHidden = false;

    executorConfig: ExecutorConfig = {
        path: path.resolve(__dirname + "/../../../executor/rabix")
    };

    openTabs = [{
        id: "?welcome",
        label: "Welcome",
        type: "Welcome"
    }];

    ignoredUpdateVersion = null;
}
