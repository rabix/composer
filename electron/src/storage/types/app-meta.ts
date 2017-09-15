import {AppExecutionContext} from "./executor-config";

export interface AppMeta {
    [path: string]: {
        workingDirectory?: string,
        jobFilePath?: string,
        swapUnlocked?: boolean,
        appIsDirty?: boolean
        executionConfig?: AppExecutionContext
    }
}
