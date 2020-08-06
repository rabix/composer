import { User } from "../../sbg-api-client/interfaces";
import {CWLExecutorConfig} from "./cwl-executor-config";
import {RabixExecutorConfig} from "./rabix-executor-config";
import {RepositoryType} from "./repository-type";
import { TabData } from "./tab-data-interface";
import {defaultRabixExecutionOutDir} from "../../controllers/rabix-execution-results.controller";
import {defaultCWLExecutionParams} from "../../controllers/cwl-execution-results.controller";
import {ProxySettings} from "./proxy-settings";

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

    rabixExecutorConfig: RabixExecutorConfig = {
        path: "",
        choice: "bundled",
        outDir: defaultRabixExecutionOutDir
    };

    cwlExecutorConfig: CWLExecutorConfig = {
        executorPath: "/usr/local/bin/cwl-runner",
        executionParams: defaultCWLExecutionParams
    };

    cwlExecutorConfigHistory: CWLExecutorConfig[] = [];

    proxySettings: ProxySettings = {
        useProxy: false,
        server: "",
        port: null,
        useAuth: false,
        username: "",
        password: ""
    };

    openTabs: TabData<any> [] = [{
        id: "?welcome",
        label: "Welcome",
        type: "Welcome"
    }];

    ignoredUpdateVersion = null;
}
