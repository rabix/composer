import {Action} from "@ngrx/store";

export const EXECUTION_START             = "[App Execution] start";
export const EXECUTION_ERROR             = "[App Execution] error";
export const EXECUTION_REQUIREMENT_ERROR = "[App Execution] requirement error";
export const EXECUTION_COMPLETE          = "[App Execution] complete";
export const EXECUTION_STOP              = "[App Execution] stop";

export const STEP_START    = "[App Execution] step start";
export const STEP_ERROR    = "[App Execution] step error";
export const STEP_COMPLETE = "[App Execution] step complete";

export const EXECUTOR_STDOUT = "[App Execution] executor standard output";
export const EXECUTOR_OUTPUT = "[App Execution] executor output";

export class ExecutionAction implements Action {
    readonly type: string;

    constructor(public appID: string) {
    }
}

export class StepExecutionAction extends ExecutionAction {
    readonly type: string;

    constructor(public appID: string, public stepID: string) {
        super(appID);
    }
}

export class ExecutionStart extends ExecutionAction {
    readonly type = EXECUTION_START;

    constructor(public appID: string,
                public steps: { id: string, label?: string }[] = [],
                public outDirPath: string) {
        super(appID);
    }
}

export class ExecutionError extends ExecutionAction {
    readonly type = EXECUTION_ERROR;


    constructor(appID: string, public exitCode) {
        super(appID);
    }
}

export class ExecutionRequirementError extends ExecutionAction {
    readonly type = EXECUTION_REQUIREMENT_ERROR;

    constructor(public appID: string, public message: string) {
        super(appID);
    }
}

export class ExecutionComplete extends ExecutionAction {
    readonly type = EXECUTION_COMPLETE;
}

export class ExecutionStop extends ExecutionAction {
    readonly type = EXECUTION_STOP;
}

export class StepExecutionStart extends StepExecutionAction {
    readonly type = STEP_START;
}

export class StepExecutionError extends StepExecutionAction {
    readonly type = STEP_ERROR;
}

export class StepExecutionCompletion extends StepExecutionAction {
    readonly type = STEP_COMPLETE;
}

export class ExecutorOutput {
    readonly type = EXECUTOR_OUTPUT;

    constructor(public appID: string, public source: string, public message: string) {

    }

}

