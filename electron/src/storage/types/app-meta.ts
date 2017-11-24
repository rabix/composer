import {AppExecutionContext} from "./executor-config";

export interface AppMeta {
    [path: string]: AppMetaEntry
}

export interface AppMetaEntry {

    workingDirectory?: string,
    jobFilePath?: string,
    swapUnlocked?: boolean,
    isDirty?: boolean
    executionConfig?: AppExecutionContext,
    job: Object

}
