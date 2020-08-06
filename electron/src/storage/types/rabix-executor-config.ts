export interface RabixExecutorConfig {
    path: string;
    choice: string | "bundled" | "custom";
    outDir: string;
}

export interface AppExecutionContext {
    jobPath: string;
    executionParams: RabixExecutorParamsConfig;
}

export interface RabixExecutorParamsConfig {
    baseDir: string;
    configurationDir: string;
    cacheDir: string;
    noContainer: boolean;
    quiet: boolean;
    verbose: boolean;
    outDir: string;
}
