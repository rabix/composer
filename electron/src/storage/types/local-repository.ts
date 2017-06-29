import {User} from "../../sbg-api-client/interfaces/user";
import {RepositoryType} from "./repository-type";

export interface CredentialsCache {
    id: string;
    user: User;
    url: string;
    token: string;
}

export class LocalRepository extends RepositoryType {

    activeCredentials: CredentialsCache = null;

    credentials: CredentialsCache[] = [];

    localFolders: string[] = [];

    publicAppsGrouping: "toolkit" | "category" = "toolkit";

    selectedAppPanel: "myApps" | "publicApps" = "myApps";

    sidebarHidden = false;

}
