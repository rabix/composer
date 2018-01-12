export interface ExecutorConfig {
    path: string;
    choice: string | "bundled" | "custom";
    outDir: string;
}

export interface AppExecutionContext {
    jobPath: string;
    executionParams: ExecutorParamsConfig;
}

export interface ExecutorParamsConfig {
    baseDir: string;
    configurationDir: string;
    cacheDir: string;
    noContainer: boolean;
    quiet: boolean;
    verbose: boolean;
    outDir: string;
}
