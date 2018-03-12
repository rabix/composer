import {spawn, ChildProcess} from "child_process";
import {ExecutorParamsConfig} from "../storage/types/executor-config";
import {createWriteStream, WriteStream} from "fs-extra";


export class Execution {

    private stdout: WriteStream;
    private stderr: WriteStream;

    private stdoutPath: string;
    private stderrPath: string;

    private process: ChildProcess;

    private executionParams: Partial<ExecutorParamsConfig>;

    constructor(public readonly jrePath: string,
                public readonly jarPath: string,
                public readonly appPath: string,
                public readonly jobPath: string) {
    }

    setStdout(filepath: string) {
        this.stdoutPath = filepath;
    }

    setStderr(filepath: string) {
        this.stderrPath = filepath;
    }

    setExecutionParams(executionParams: Partial<ExecutorParamsConfig>) {
        this.executionParams = executionParams;
    }

    run(): ChildProcess {

        this.process = spawn(this.jrePath, [
            "-jar",
            this.jarPath,
            "--enable-composer-logs",
            this.appPath,
            this.jobPath,
            ...this.parseExecutorParamsToArgs(this.executionParams),
        ]);

        if (this.stdoutPath) {
            this.stdout = createWriteStream(this.stdoutPath, {autoClose: true, encoding: "utf8"});
            this.process.stdout.pipe(this.stdout);
        }

        if (this.stderrPath) {
            this.stderr = createWriteStream(this.stderrPath, {autoClose: true, encoding: "utf8"});
            this.process.stderr.pipe(this.stderr);
        }

        return this.process;
    }

    getCommandLineString(): string {
        return [
            this.jrePath,
            "-jar",
            this.jarPath,
            this.appPath,
            this.jobPath,
            ...this.parseExecutorParamsToArgs(this.executionParams)
        ].join(" ");
    }

    kill() {
        if (this.stdout) {
            this.stdout.close();
        }

        if (this.stderr) {
            this.stderr.close();
        }

        if (this.process) {
            this.process.stdout.removeAllListeners();
            this.process.stderr.removeAllListeners();

            this.process.kill();
        }

    }

    private parseExecutorParamsToArgs(params: Partial<ExecutorParamsConfig> = {}): string[] {

        const output = [];

        if (!params) {
            params = {};
        }

        if (params.baseDir) {
            output.push("--basedir", params.baseDir);
        }

        if (params.verbose) {
            output.push("--verbose");
        }

        if (params.quiet) {
            output.push("--quiet");
        }

        if (params.noContainer) {
            output.push("--no-container");
        }

        if (params.cacheDir) {
            output.push("--cache-dir", params.cacheDir);
        }

        if (params.configurationDir) {
            output.push("--configuration-dir", params.configurationDir);
        }

        if (params.outDir) {
            output.push("--outdir", params.outDir);
        }

        return output;
    }
}
