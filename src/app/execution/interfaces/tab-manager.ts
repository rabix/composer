import {InjectionToken} from "@angular/core";

export const FileOpenerToken = new InjectionToken("execution.fileOpener");

export interface FileOpener {
    open(path: string, language: string): void;
}
