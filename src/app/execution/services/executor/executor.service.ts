import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";
import {ExecutorParamsConfig} from "../../../../../electron/src/storage/types/executor-config";
import {Injectable} from "@angular/core";
import {Store} from "@ngrx/store";
import {
    ExecutorOutputAction,
    ExecutionCompletedAction,
    ExecutionErrorAction,
    ExecutionStoppedAction,
    ExecutionRequirementErrorAction,
    ExecutionPreparedAction,
    ExecutionStartedAction,
    EXECUTION_STOP,
    ExecutionStopAction
} from "../../actions/execution.actions";
import {WorkflowModel, CommandLineToolModel} from "cwlts/models";
import * as Yaml from "js-yaml";
import {Actions} from "@ngrx/effects";
import {filter} from "rxjs/operators";

const {RabixExecutor} = window["require"]("electron").remote.require("./src/rabix-executor/rabix-executor");
const path            = window["require"]("path");

@Injectable()
export class ExecutorService2 {

    constructor(private store: Store<any>, private actions: Actions) {
    }

    makeOutputDirectoryName(rootDir, appID, user = "local", time = new Date()) {

        const base = rootDir;

        let projectSlug;
        let appSlug;
        const executionDate = [
            time.getFullYear(),
            time.getMonth() + 1,
            time.getDate(),
            time.getHours(),
            time.getMinutes(),
            time.getSeconds()
        ].map((el, i) => {
            if (i > 0 && el.toString().length < 2) {
                return "0" + el;
            }

            return el;
        }).join("-");

        if (user === "local") {
            appSlug = path.basename(appID).split(".").slice(0, -1).join(".");
        } else {
            [, projectSlug, appSlug] = appID.split("/");
        }

        return [
            base,
            user,
            projectSlug,
            appSlug,
            executionDate
        ].filter(v => v).join(path.sep);

    }

    private getStepList(model: WorkflowModel | CommandLineToolModel): { id: string, label: string }[] {

        if (model instanceof WorkflowModel) {
            return model.steps.map(step => ({
                id: step.id,
                label: step.label
            }));
        } else {
            return [{
                id: model.id,
                label: model.label
            }];
        }

    }

    execute(appID: string, model: WorkflowModel | CommandLineToolModel, jobValue: Object = {}, executorPath?: string, executionParams: Partial<ExecutorParamsConfig> = {}): Observable<any> {


        const content  = this.serialize(model);
        const executor = new RabixExecutor(executorPath);

        const stepList = this.getStepList(model);

        return Observable.create((obs: Observer<any>) => {

            let execution;

            /** Flag used to throw a stop action if we unsubscribe from this while execution is in progress */
            let processStillRunning = true;

            this.store.dispatch(new ExecutionPreparedAction(
                appID,
                stepList,
                executionParams.outDir
            ));

            const startRunner = executor.execute(content, jobValue, executionParams).catch(ex => {
                processStillRunning = false;
                throw ex;
            });

            startRunner.then(runner => {

                if (obs.closed) {
                    return;
                }

                this.store.dispatch(new ExecutionStartedAction(appID));

                execution = runner;

                const process = execution.run();

                obs.next(execution.getCommandLineString());

                process.on("exit", (code, sig) => {
                    processStillRunning = false;

                    /** Successful completion if exit code is 0 */
                    const isCompleted = code === 0;

                    /**
                     * Killing a process manually will throw either exitCode 143, or
                     * a SIGINT/SIGTERM/SIGKILL in different circumstances, so we check for both
                     * */
                    const isCancelled = code === 143 || sig;


                    if (isCompleted) {
                        this.store.dispatch(new ExecutionCompletedAction(appID));
                        obs.complete();
                        return;

                    } else if (isCancelled) {
                        /**
                         * Cancellation is initially triggered from unsubscribing from killing the process
                         * when unsubscribing from the observable.
                         * ExecutionStopAction is therefore dispatched from the original place.
                         * @see executionUnsubscribe
                         */
                        obs.complete();
                        return;
                    } else {
                        this.store.dispatch(new ExecutionErrorAction(appID, code));
                        obs.error(new Error(`Execution failed with exit code ${code}.`));
                    }

                });

                process.on("error", (err: any) => {
                    if (err.code === "ENOENT" && err.path === "java") {
                        obs.error(new Error("Cannot run Java process. Please check if it is properly installed."));
                        return;
                    }

                    obs.error(new Error(err));
                });

                process.stdout.on("data", data => {

                    this.store.dispatch(new ExecutorOutputAction(appID, "stdout", data.toString()));

                    obs.next(data.toString());
                });

                process.stderr.on("data", data => {
                    this.store.dispatch(new ExecutorOutputAction(appID, "stderr", data.toString()));
                });

            }, ex => {
                this.store.dispatch(new ExecutionRequirementErrorAction(appID, ex.message));
                obs.error(new Error(ex));
            });

            const cleanup = () => {
                if (processStillRunning) {
                    this.store.dispatch(new ExecutionStoppedAction(appID));
                }

                if (execution) {
                    execution.kill();
                }
                obs.complete();
            };

            this.actions.ofType(EXECUTION_STOP).pipe(
                filter((action: ExecutionStopAction) => action.appID === appID)
            ).take(1).subscribe(() => cleanup());

            /** @name executionUnsubscribe */
            return () => cleanup();
        });
    }

    private serialize(model: WorkflowModel | CommandLineToolModel): string {
        let serialized;

        if (model instanceof WorkflowModel) {
            serialized = model.serializeEmbedded();
        } else {
            serialized = model.serialize();
        }

        // Bunny traverses mistakenly into this to look for actual inputs, it might have been resolved by now
        delete serialized["sbg:job"];

        return Yaml.dump(serialized);
    }

}
