import {InjectionToken} from "@angular/core";

export const DirectoryExplorerToken = new InjectionToken("execution.directoryExplorer");

export interface DirectoryExplorer {
    explore: (dirname: string) => void;
}
