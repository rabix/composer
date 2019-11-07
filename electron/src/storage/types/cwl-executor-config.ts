export interface CWLExecutorConfig {
    executorPath: string;
    outDir: string;
}

export interface AppExecutionContext {
    jobPath: string;
    cwlExecutionParams: CWLExecutorParamsConfig;
}

export interface CWLExecutorParamsConfig {
    baseDir: string;
    configurationDir: string;
    cacheDir: string;
    noContainer: boolean;
    quiet: boolean;
    verbose: boolean;
    outDir: string;
}
