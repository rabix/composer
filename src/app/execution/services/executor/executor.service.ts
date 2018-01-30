import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";
import {ExecutorParamsConfig} from "../../../../../electron/src/storage/types/executor-config";
import {Injectable} from "@angular/core";
import {Store} from "@ngrx/store";
import {
    ExecutorOutputAction,
    ExecutionStartAction,
    ExecutionCompleteAction,
    ExecutionErrorAction,
    ExecutionStopAction,
    ExecutionRequirementErrorAction
} from "../../actions/execution.actions";
import {WorkflowModel, CommandLineToolModel} from "cwlts/models";
import * as Yaml from "js-yaml";

const {RabixExecutor} = window["require"]("electron").remote.require("./src/rabix-executor/rabix-executor");
const path            = window["require"]("path");

@Injectable()
export class ExecutorService2 {

    constructor(private store: Store<any>) {

    }

    makeOutputDirectoryName(rootDir, appID, user = "local", time = new Date()) {

        const base = rootDir;

        let projectSlug;
        let appSlug;
        let executionDate = [
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

        const fullPath = [
            base,
            user,
            projectSlug,
            appSlug,
            executionDate
        ].filter(v => v).join(path.sep);

        return fullPath;

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
            let isPrematureStop = true;

            this.store.dispatch(new ExecutionStartAction(
                appID,
                stepList,
                executionParams.outDir
            ));

            const startRunner = executor.execute(content, jobValue, executionParams).catch(ex => {
                isPrematureStop = false;
                throw ex;
            });

            startRunner.then(runner => {

                if (obs.closed) {
                    return;
                }

                execution = runner;

                const process = execution.run();

                obs.next(execution.getCommandLineString());

                process.on("exit", code => {
                    isPrematureStop = false;

                    const ok      = 0;
                    const sigterm = 143;

                    if (code === ok) {
                        this.store.dispatch(new ExecutionCompleteAction(appID));
                        return obs.complete();
                    } else if (code === sigterm) {
                        // this.store.dispatch(new ExecutionStopAction(appID));
                        return obs.complete();
                    } else {
                        this.store.dispatch(new ExecutionErrorAction(appID, code));
                    }


                    obs.error(new Error(`Execution failed with exit code ${code}.`))
                });

                process.on("error", (err: any) => {
                    if (err.code === "ENOENT" && err.path === "java") {
                        obs.error(new Error("Cannot run Java process. Please check if it is properly installed."));
                    }
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

            return () => {

                if (isPrematureStop) {
                    this.store.dispatch(new ExecutionStopAction(appID));
                }

                if (execution) {
                    execution.kill();
                }
                obs.complete();

            }

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
