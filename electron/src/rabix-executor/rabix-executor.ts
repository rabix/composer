import {spawn} from "child_process";
import * as fs from "fs-extra";
import * as path from "path";
import * as tmp from "tmp";
import {IPC_EOS_MARK} from "../constants";
import {ExecutorParamsConfig} from "../storage/types/executor-config";
import EventEmitter = NodeJS.EventEmitter;

export type ProcessCallback = (err?: Error, stdout?: string, stderr?: string) => void;

export class RabixExecutor {

    jarPath = "";
    jrePath = "java";

    private version: string;

    constructor(jarPath = __dirname + "/../../executor/lib/rabix-cli.jar") {
        this.jarPath = path.normalize(jarPath);
    }

    getVersion(callback?: ProcessCallback, emitter?: EventEmitter) {
        const child = spawn(this.jrePath, ["-jar", this.jarPath, "--version"]);

        let output = "";
        let error  = "";

        child.stdout.on("data", data => {
            output += data
        });

        child.stderr.on("error", err => {
            error += err + "\n"
        });

        child.on("error", err => {

            callback(new Error("Cannot start Rabix Executor. Did you properly install Java Runtime Environment?"));
        });

        child.on("close", () => {
            if (error) {
                callback(new Error(error));
                return;
            }

            const version = output.match(/\d+\.\d+\.\d+/);
            if (!version) {
                return callback(null, null);
            }

            return callback(null, version[0]);
        });


        if (emitter && child.connected) {
            emitter.on("stop", () => this.killChild(child));
        }
    }

    private killChild(child, callback?) {

        child.stdout.removeAllListeners();
        child.stderr.removeAllListeners();

        child.kill();

        if (typeof callback === "function") {
            callback();
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
    execute(content: string, jobPath: string, executionParams: Partial<ExecutorParamsConfig> = {}, dataCallback, emitter?: EventEmitter) {

        tmp.file((err, appTempFilePath, fd, cleanupCallback) => {

            if (err) {
                return dataCallback(err);
            }

            fs.writeFile(appTempFilePath, content, (err) => {

                if (err) {
                    return dataCallback(err);
                }

                const processCommand = `java -jar ${this.jarPath}`;

                const executorArgs = [
                    "-jar",
                    this.jarPath,
                    appTempFilePath,
                    jobPath,
                    ...this.parseExecutorParamsToArgs(executionParams)
                ];

                const rabixProcess = spawn(this.jrePath, executorArgs, {});

                if (emitter) {
                    emitter.on("stop", () => {

                        rabixProcess.stdout.removeAllListeners();
                        rabixProcess.stderr.removeAllListeners();

                        rabixProcess.kill();
                        cleanupCallback();
                    });
                }

                const processCommandLine = [processCommand, ...executorArgs].join(" ");

                dataCallback(null, `Running “${processCommandLine}”`);

                rabixProcess.stdout.on("data", (data) => {

                    const out = data.toString();

                    try {
                        const json = JSON.parse(out);
                        dataCallback(null, json);
                    } catch (err) {
                        dataCallback(null, out);
                    }

                });

                rabixProcess.stderr.on("data", data => {
                    /**
                     * This “ERR: ” prefix is important because client listener uses it to determine how to treat incoming data
                     * @name RabixExecutor.__errorPrefixing
                     * @see AppEditorBase.__errorDiscriminator
                     */
                    dataCallback(null, "ERR: " + data);
                });

                // when the spawn child process exits, check if there were any errors and close the writeable stream
                rabixProcess.on("exit", (code, a, b) => {

                    cleanupCallback();

                    if (code !== 0) {
                        return dataCallback(new Error("Execution failed with non-zero exit code."));
                    }

                    dataCallback(null, "Gathering results...");

                    const tempBasename = path.basename(appTempFilePath, ".tmp");
                    const outputRoot   = path.dirname(jobPath);

                    fs.readdir(outputRoot, (err, files) => {
                        if (err) {
                            return dataCallback(err);
                        }

                        for (let i = 0, cnt = files.length; i < cnt; i++) {

                            if (files[i].startsWith(tempBasename)) {
                                const fullOutputDir = outputRoot + path.sep + files[i];

                                console.log("Moving ", fullOutputDir, "to", executionParams.outDir);
                                fs.move(fullOutputDir, executionParams.outDir, {
                                    overwrite: true
                                }, (err) => {

                                    if (err) {
                                        return dataCallback(err);
                                    }

                                    dataCallback(null, "Done.");
                                    dataCallback(null, IPC_EOS_MARK);
                                });

                                return;
                            }

                        }

                        return dataCallback(new Error("Cannot find job outputs."));
                    });


                });

            });


        });


    }

    private probeBinary(path = "", callback = (err?: Error) => void 0) {
        fs.access(path, fs.constants.X_OK, callback);
    }


}
