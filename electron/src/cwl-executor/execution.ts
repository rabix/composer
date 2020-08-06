import {spawn, ChildProcess} from "child_process";
import {CWLExecutionParamsConfig} from "../storage/types/cwl-executor-config";
import {createWriteStream, WriteStream} from "fs-extra";


export class Execution {

    private stdout: WriteStream;
    private stderr: WriteStream;

    private stdoutPath: string;
    private stderrPath: string;

    private process: ChildProcess;

    private executionParams: Partial<CWLExecutionParamsConfig>;

    constructor(public readonly jrePath: string,
                public readonly jarPath: string,
                public readonly executorPath: string,
                public readonly appPath: string,
                public readonly jobPath: string,
                public readonly isLegacy: boolean) {
    }

    setStdout(filepath: string) {
        this.stdoutPath = filepath;
    }

    setStderr(filepath: string) {
        this.stderrPath = filepath;
    }

    setCWLExecutionParams(executionParams: Partial<CWLExecutionParamsConfig>) {
        this.executionParams = executionParams;
    }

    run(): ChildProcess {

        if (this.isLegacy) {
            this.process = spawn(this.jrePath, [
                "-jar",
                this.jarPath,
                "--enable-composer-logs",
                this.appPath,
                this.jobPath,
                ...this.parseExecutionParamsToArgs(this.executionParams),
            ]);
        } else {
            this.process = spawn(this.executorPath, [
                ...this.parseExecutionParamsToArgs(this.executionParams),
                this.appPath,
                this.jobPath
            ]);
        }

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
        if (this.isLegacy) {
            return [
                this.jrePath,
                "-jar",
                this.jarPath,
                this.appPath,
                this.jobPath,
                ...this.parseExecutionParamsToArgs(this.executionParams)
            ].join(" ");
        }

        return [
            this.executorPath,
            ...this.parseExecutionParamsToArgs(this.executionParams),
            this.appPath,
            this.jobPath
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

    private parseExecutionParamsToArgs(params: Partial<CWLExecutionParamsConfig> = {}): string[] {

        const output = [];

        if (!params) {
            params = {};
        }

        if (params.outDir.prefix && params.outDir.value) {
            if (this.isLegacy) {
                output.push("--outdir", params.outDir.value);
            } else {
                output.push(params.outDir.prefix, params.outDir.value);
            }
        }

        if (!this.isLegacy) {
            if (params.extras) {
                output.push(...params.extras.split(/\s+/));
            }
        }

        return output;
    }
}
