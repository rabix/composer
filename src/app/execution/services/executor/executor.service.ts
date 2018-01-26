import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";
import {ExecutorParamsConfig} from "../../../../../electron/src/storage/types/executor-config";
import {Injectable} from "@angular/core";
import {Store} from "@ngrx/store";
import {
    ExecutorOutput,
    ExecutionStart,
    ExecutionComplete,
    ExecutionError,
    ExecutionStop,
    ExecutionRequirementError
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

            this.store.dispatch(new ExecutionStart(
                appID,
                stepList,
                executionParams.outDir
            ));

            executor.execute(content, jobValue, executionParams).then(runner => {

                if (obs.closed) {
                    return;
                }


                execution = runner;

                const process = execution.run();

                obs.next(execution.getCommandLineString());

                process.on("exit", code => {
                    console.log("stdout exit", code);
                    isPrematureStop = false;


                    if (code === 0) {
                        this.store.dispatch(new ExecutionComplete(appID));
                        return obs.complete();
                    } else {
                        this.store.dispatch(new ExecutionError(appID, code));
                    }


                    obs.error(new Error(`Execution failed with exit code ${code}.`))
                });

                process.on("error", (err: any) => {
                    console.log("process error", err);
                    if (err.code === "ENOENT" && err.path === "java") {
                        obs.error(new Error("Cannot run Java process. Please check if it is properly installed."));
                    }
                });

                process.stdout.on("data", data => {

                    this.store.dispatch(new ExecutorOutput(appID, "stdout", data.toString()));

                    obs.next(data.toString());
                });

                process.stderr.on("data", data => {
                    this.store.dispatch(new ExecutorOutput(appID, "stderr", data.toString()));
                    // console.log("stderr data", data.toString());
                });

            }, ex => {
                this.store.dispatch(new ExecutionRequirementError(appID, ex.message));
                obs.error(new Error(ex));
            });

            return () => {

                if (isPrematureStop) {
                    this.store.dispatch(new ExecutionStop(appID));
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
