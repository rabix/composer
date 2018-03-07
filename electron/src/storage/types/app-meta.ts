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
    /** Job is an actual job that will be sent to execution */
    job: Object,
    /** Test job is a job object used for testing command line parameters while building a CLT */
    testJob?: Object,

}
