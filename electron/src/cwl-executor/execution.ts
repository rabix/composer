import {spawn, ChildProcess} from "child_process";
import {CWLExecutorParamsConfig} from "../storage/types/cwl-executor-config";
import {createWriteStream, WriteStream} from "fs-extra";


export class Execution {

    private stdout: WriteStream;
    private stderr: WriteStream;

    private stdoutPath: string;
    private stderrPath: string;

    private process: ChildProcess;

    private executionParams: Partial<CWLExecutorParamsConfig>;

    constructor(public readonly executorPath: string,
                public readonly appPath: string,
                public readonly jobPath: string) {
    }

    setStdout(filepath: string) {
        this.stdoutPath = filepath;
    }

    setStderr(filepath: string) {
        this.stderrPath = filepath;
    }

    setCWLExecutionParams(executionParams: Partial<CWLExecutorParamsConfig>) {
        this.executionParams = executionParams;
    }

    run(): ChildProcess {

        this.process = spawn(this.executorPath, [
            ...this.parseExecutorParamsToArgs(this.executionParams),
            this.appPath,
            this.jobPath
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
            this.executorPath,
            ...this.parseExecutorParamsToArgs(this.executionParams),
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

    private parseExecutorParamsToArgs(params: Partial<CWLExecutorParamsConfig> = {}): string[] {

        const output = [];

        if (!params) {
            params = {};
        }

        if (params.executorParams) {
            output.push(params.executorParams.split(' '));
        }

        if (params.outDir.prefix && params.outDir.value) {
            output.push(params.outDir.prefix, params.outDir.value);
        }

        return output;
    }
}
