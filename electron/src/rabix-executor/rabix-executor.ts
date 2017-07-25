import {exec, spawn} from "child_process";
import * as fs from "fs";
import * as tmp from "tmp";
import {ExecutorConfig, ExecutorParamsConfig} from "../storage/types/executor-config";

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
     * @param callback
     */
    execute(path, content: string, jobPath: string, executionParams: Partial<ExecutorParamsConfig> = {}, callback) {
        this.probeBinary(this.config.path, err => {
            if (err) {
                let message = "Rabix Executor path is not configured properly.";
                return callback(new Error(message))
            }

            tmp.file((err, appTempFilePath, fd, cleanupCallback) => {

                if (err) {
                    return callback(err);
                }

                fs.writeFile(appTempFilePath, content, (err) => {

                    if (err) {
                        return callback(err);
                    }


                    const rabixExecutorPath = this.config.path;
                    const executorArgs      = [
                        appTempFilePath,
                        jobPath,
                        ...this.parseExecutorParamsToArgs(executionParams)
                    ];

                    const process            = spawn(rabixExecutorPath, executorArgs, {});
                    const processCommandLine = [rabixExecutorPath, ...executorArgs].join(" ");

                    callback(null, `Running “${processCommandLine}”`);

                    process.stdout.on("data", (data) => {

                        const out = data.toString();
                        console.log("STDOUT", out);

                        try {
                            const json = JSON.parse(out);
                            callback(null, json);
                        } catch (err) {
                            callback(null, out);
                        }

                    });

                    process.stderr.on("data", data => {
                        console.log("STDERR", data.toString());
                        /**
                         * This “ERR: ” prefix is important because client listener uses it to determine how to treat incoming data
                         * @name RabixExecutor.__errorPrefixing
                         * @see AppEditorBase.__errorDiscriminator
                         */
                        callback(null, "ERR: " + data);
                    });

                    // when the spawn child process exits, check if there were any errors and close the writeable stream
                    process.on("exit", (code, a, b) => {

                        cleanupCallback();

                        if (code !== 0) {
                            return callback(new Error("Execution failed with non-zero exit code."));
                        }

                        console.log("Exit", code);
                        callback(null, "Done.");
                        callback(null, null);


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
