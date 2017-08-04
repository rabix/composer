import {App} from "../../sbg-api-client/interfaces/app";
import {Project} from "../../sbg-api-client/interfaces/project";
import {RepositoryType} from "./repository-type";

export class UserRepository extends RepositoryType {

    projects: Project[] = null;

    apps: App[] = null;

    publicApps: App[] = null;

    openProjects: string[] = [];

    projectFetchTimestamp = 0;

    appFetchTimestamp = 0;
}
