export interface CWLExecutorConfig {
    executorPath: string;
    executionParams: CWLExecutionParamsConfig;
}

export interface AppExecutionContext {
    jobPath: string;
    cwlExecutionParams: CWLExecutionParamsConfig;
}

export interface CWLExecutionParamsConfig {
    outDir: CWLExecutionOutDirConfig;
    extras: string;
}

export interface CWLExecutionOutDirConfig {
    prefix?: string;
    value: string;
}
