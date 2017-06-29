import {App} from "../../sbg-api-client/interfaces/app";
import {Project} from "../../sbg-api-client/interfaces/project";
import {RepositoryType} from "./repository-type";
import {RecentAppTab} from "./recent-app-tab";

export class UserRepository extends RepositoryType {

    projects: Project[] = [];

    apps: App[] = [];

    publicApps: App[] = [];

    openProjects: string[] = [];

    projectFetchTimestamp = 0;

    appFetchTimestamp = 0;
}
