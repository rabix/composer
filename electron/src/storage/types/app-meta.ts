export interface AppMeta {
    [path: string]: {
        workingDirectory?: string,
        jobFilePath?: string,
        swapUnlocked?: boolean
    }
}
