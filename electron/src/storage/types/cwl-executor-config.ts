export interface CWLExecutorConfig {
    executorPath: string;
    outDir: CWLExecutorParamsOutDir;
    executorParams: string;
}

export interface AppExecutionContext {
    jobPath: string;
    cwlExecutionParams: CWLExecutorParamsConfig;
}

export interface CWLExecutorParamsConfig {
    executorParams: string;
    outDir: CWLExecutorParamsOutDir;
}

export interface CWLExecutorParamsOutDir {
    prefix?: string;
    value: string;
}
