import {ExecutionState} from "./types";
import {ExecutionError} from "./execution-error";
import {StepExecution} from "./step-progress";

export class AppExecution {

    readonly state: ExecutionState;
    readonly stepExecution: StepExecution[];
    readonly outdir: string;
    readonly error?: ExecutionError;
    readonly startTime?: number;
    readonly endTime?: number;

    constructor(outdir: string,
                stepProgress: StepExecution[],
                error?: ExecutionError,
                state: ExecutionState = "pending",
                startTime?: number,
                endTime?: number) {

        this.error         = error;
        this.outdir        = outdir;
        this.state         = state;
        this.stepExecution = stepProgress;
        this.startTime     = startTime;
        this.endTime       = endTime;

    }

    update(params: Partial<AppExecution>) {

        const update = Object.assign({}, this, params) as Partial<AppExecution>;

        return new AppExecution(
            update.outdir,
            update.stepExecution,
            update.error,
            update.state,
            update.startTime,
            update.endTime
        );
    }

    failProcess(error: ExecutionError, ...failedStepIDs: string[]) {
        return this.update({
            error,
            state: "failed",
            endTime: Date.now(),
            stepExecution: this.stepExecution.map(step => {

                if (~failedStepIDs.indexOf(step.id)) {
                    return step.transitionTo("failed");
                }

                switch (step.state) {

                    case "started":
                        return step.transitionTo("failed");

                    case "pending":
                        return step.transitionTo("stopped");

                    default:
                        return step;
                }

            })
        });
    }

    stop(): AppExecution {
        return this.update({
            state: "stopped",
            startTime: undefined,
            endTime: undefined,
            error: undefined,
            stepExecution: this.stepExecution.map(step => {
                switch (step.state) {
                    case "pending":
                    case "started":
                        return step.transitionTo("stopped");
                    default:
                        return step;
                }
            })
        });
    }

    start(): AppExecution {
        return this.update({
            state: "started",
            startTime: Date.now(),
            endTime: undefined,
            error: undefined,
            stepExecution: this.stepExecution.map(step => step.transitionTo("pending"))
        });
    }

    complete(): AppExecution {
        return this.update({
            state: "completed",
            endTime: Date.now(),
            stepExecution: this.stepExecution.map(step => step.transitionTo("completed"))
        });
    }

}
