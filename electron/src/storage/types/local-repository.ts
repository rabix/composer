import {User} from "../../sbg-api-client/interfaces/user";
import {AppExecutionContext, ExecutorConfig} from "./executor-config";
import {RepositoryType} from "./repository-type";

export interface CredentialsCache {
    id: string;
    user: User;
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
        path: ""
    }

}
