import {exec, spawn} from "child_process";
import * as fs from "fs";
import * as tmp from "tmp";
import {ExecutorConfig, ExecutorParamsConfig} from "../storage/types/executor-config";
import EventEmitter = NodeJS.EventEmitter;

export type ProcessCallback = (err?: Error, stdout?: string, stderr?: string) => void;
const noop = () => {
};

export class RabixExecutor {

    private config: ExecutorConfig;
    private version: string;

    constructor(config: ExecutorConfig) {
        this.config = config;
    }

    getVersion(callback?: ProcessCallback) {
        this.run("--version", callback)
    }

    run(cmd: string, callback: ProcessCallback = noop) {

        this.probeBinary(this.config.path, (err) => {
            if (err) {
                return callback(err);
            }

            exec(this.getCommand(cmd), callback);

        });

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

    /**
     * Executes the CWL app.
     *
     * Steps:
     * - Create a temporary file in which CWL description is stored
     * - Write CWL into it
     * - Create a command line from temp file path, job json and other rabix parameters that were given as options
     * - Spawn a rabix process that runs that temporary file with given job json and other execution parameters
     * - Stream output from process stdin and stderr back to the client
     * - Send “null” downstream that marks the end of the process, so the client can unsubscribe.
     * - Clean up temporary stuff
     *
     * Rabix sends execution logs to stderr, so we can't distinguish those from actual errors.
     *
     * @param path Unused
     * @param {string} content CWL document that describes the app
     * @param {string} jobPath Path to the job json file
     * @param {Partial<ExecutorParamsConfig>} executionParams Rabix executor execution parameters
     * @param dataCallback
     * @param emitter
     */
    execute(path, content: string, jobPath: string, executionParams: Partial<ExecutorParamsConfig> = {}, dataCallback, emitter?: EventEmitter) {
        this.probeBinary(this.config.path, err => {
            if (err) {
                let message = "Rabix Executor path is not configured properly.";
                return dataCallback(new Error(message))
            }

            tmp.file((err, appTempFilePath, fd, cleanupCallback) => {

                if (err) {
                    return dataCallback(err);
                }

                fs.writeFile(appTempFilePath, content, (err) => {

                    if (err) {
                        return dataCallback(err);
                    }


                    const rabixExecutorPath = this.config.path;
                    const executorArgs      = [
                        appTempFilePath,
                        jobPath,
                        ...this.parseExecutorParamsToArgs(executionParams)
                    ];

                    const rabixProcess = spawn(rabixExecutorPath, executorArgs, {});

                    if (emitter) {
                        emitter.on("stop", () => {

                            rabixProcess.stdout.removeAllListeners();
                            rabixProcess.stderr.removeAllListeners();

                            rabixProcess.kill();
                            cleanupCallback();
                        });
                    }

                    const processCommandLine = [rabixExecutorPath, ...executorArgs].join(" ");

                    dataCallback(null, `Running “${processCommandLine}”`);

                    rabixProcess.stdout.on("data", (data) => {

                        const out = data.toString();
                        console.log("STDOUT", out);

                        try {
                            const json = JSON.parse(out);
                            dataCallback(null, json);
                        } catch (err) {
                            dataCallback(null, out);
                        }

                    });

                    rabixProcess.stderr.on("data", data => {
                        console.log("STDERR", data.toString());
                        /**
                         * This “ERR: ” prefix is important because client listener uses it to determine how to treat incoming data
                         * @name RabixExecutor.__errorPrefixing
                         * @see AppEditorBase.__errorDiscriminator
                         */
                        dataCallback(null, "ERR: " + data);
                    });

                    // when the spawn child process exits, check if there were any errors and close the writeable stream
                    rabixProcess.on("exit", (code, a, b) => {

                        console.log("Exiting process");

                        cleanupCallback();

                        if (code !== 0) {
                            return dataCallback(new Error("Execution failed with non-zero exit code."));
                        }

                        dataCallback(null, "Done.");
                        dataCallback(null, "$$EOS$$");


                    });

                });


            });


        });
    }

    private getCommand(cmd: string) {
        return `${this.config.path} ${cmd}`;
    }

    private probeBinary(path: string, callback) {
        fs.access(path, fs.constants.X_OK, callback);
    }


}
