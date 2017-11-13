import {spawn} from "child_process";
import * as fs from "fs-extra";
import * as path from "path";
import * as tmp from "tmp";
import {EXECUTOR_OUTDIR_PREFIX, IPC_EOS_MARK} from "../constants";
import {ExecutorParamsConfig} from "../storage/types/executor-config";
import EventEmitter = NodeJS.EventEmitter;

export type ProcessCallback = (err?: Error, stdout?: string, stderr?: string) => void;

export function findDefaultExecutorJar() {
    const basePath    = path.normalize(__dirname + "/../../executor/lib/rabix-cli.jar");
    const fixedAsar   = basePath.replace("app.asar", "app.asar.unpacked");
    const fixedDevEnv = fixedAsar.replace(
        ["electron", "dist", "executor", "lib"].join(path.sep),
        ["electron", "executor", "lib"].join(path.sep)
    );
    return fixedDevEnv;
}

export class RabixExecutor {

    jarPath = "";
    jrePath = "java";

    constructor(jarPath = findDefaultExecutorJar()) {
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

    private storeToTempFile(content: string): Promise<string> {
        return new Promise((resolve, reject) => {

            tmp.tmpName((err, tmpPath) => {

                if (err) return reject(err);

                fs.writeFile(tmpPath, content, {
                    encoding: "utf8"
                }, (err) => {
                    if (err) return reject(err);

                    resolve(tmpPath);
                });

            });

        });
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
     * Rabix sends execution logs to stderr, so we can't distinguish those from actual errors.1
     *
     * @param path Unused
     * @param {string} content CWL document that describes the app
     * @param {Object} jobPath Path to the job json file
     * @param {Partial<ExecutorParamsConfig>} executionParams Rabix executor execution parameters
     * @param dataCallback
     * @param emitter
     */
    execute(content: string, jobValue: Object = {}, executionParams: Partial<ExecutorParamsConfig> = {}, dataCallback, emitter?: EventEmitter) {

        const cleanupHandlers = [] as Function[];
        const cleanup         = () => cleanupHandlers.forEach(c => c());

        const appTempFile = this.storeToTempFile(content).then(fpath => {
            cleanupHandlers.push(() => fs.unlink(fpath));
            return fpath;
        });

        const appJobFile = this.storeToTempFile(JSON.stringify(jobValue)).then(fpath => {
            cleanupHandlers.push(() => fs.unlink(fpath));
            return fpath;
        });


        Promise.all([
            appTempFile,
            appJobFile
        ]).then((filePaths: [string, string]) => {
            const [appFilePath, jobFilePath] = filePaths;

            const processCommand = "java";
            const executorArgs   = [
                "-jar",
                this.jarPath,
                appFilePath,
                jobFilePath,
                ...this.parseExecutorParamsToArgs(executionParams)
            ];

            const rabixProcess = spawn(this.jrePath, executorArgs, {});
            if (emitter) {
                emitter.on("stop", () => {

                    rabixProcess.stdout.removeAllListeners();
                    rabixProcess.stderr.removeAllListeners();

                    rabixProcess.kill();
                    cleanup();
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

                cleanup();

                if (code !== 0) {
                    return dataCallback(new Error("Execution failed with non-zero exit code."));
                }

                dataCallback(null, "Gathering outputs...");

                const tempBasename = path.basename(appFilePath, ".tmp");
                const outputRoot   = path.dirname(jobFilePath);

                fs.readdir(outputRoot, (err, files) => {
                    if (err) {
                        return dataCallback(err);
                    }

                    for (let i = 0, cnt = files.length; i < cnt; i++) {

                        if (files[i].startsWith(tempBasename)) {
                            const fullOutputDir = outputRoot + path.sep + files[i];

                            fs.move(fullOutputDir, executionParams.outDir, {
                                overwrite: true
                            }, (err) => {

                                if (err) {
                                    return dataCallback(err);
                                }

                                dataCallback(null, EXECUTOR_OUTDIR_PREFIX + executionParams.outDir);
                                dataCallback(null, "Done.");
                                dataCallback(null, IPC_EOS_MARK);
                            });

                            return;
                        }

                    }

                    return dataCallback(new Error("Cannot find job outputs."));
                });


            });

        }).catch(err => {
            cleanup();
            dataCallback(err);
        });

    }

    private probeBinary(path = "", callback = (err?: Error) => void 0) {
        fs.access(path, fs.constants.X_OK, callback);
    }

}
