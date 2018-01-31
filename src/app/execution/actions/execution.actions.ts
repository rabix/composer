import {Action} from "@ngrx/store";

export const EXECUTION_PREPARE           = "[App Execution] prepare";
export const EXECUTION_START             = "[App Execution] start";
export const EXECUTION_ERROR             = "[App Execution] error";
export const EXECUTION_REQUIREMENT_ERROR = "[App Execution] requirement error";
export const EXECUTION_COMPLETE          = "[App Execution] complete";
export const EXECUTION_STOP              = "[App Execution] stop";
export const EXECUTOR_OUTPUT             = "[App Execution] executor output";
export const EXECUTION_STEP_FAIL         = "[App Execution] step failProcess";
export const EXECUTION_STEP_START        = "[App Execution] step start";
export const EXECUTION_STEP_COMPLETE     = "[App Execution] step complete";

export class ExecutionAction implements Action {
    readonly type: string;

    constructor(public appID: string) {
    }
}

export class ExecutionPrepareAction extends ExecutionAction {
    readonly type = EXECUTION_PREPARE;

    constructor(public appID: string,
                public steps: { id: string, label?: string }[] = [],
                public outDirPath: string) {
        super(appID);
    }
}

export class ExecutionStartAction extends ExecutionAction {
    readonly type = EXECUTION_START;
}

export class ExecutionErrorAction extends ExecutionAction {
    readonly type = EXECUTION_ERROR;


    constructor(appID: string, public exitCode) {
        super(appID);
    }
}

export class ExecutionRequirementErrorAction extends ExecutionAction {
    readonly type = EXECUTION_REQUIREMENT_ERROR;

    constructor(public appID: string, public message: string) {
        super(appID);
    }
}

export class ExecutionCompleteAction extends ExecutionAction {
    readonly type = EXECUTION_COMPLETE;
}

export class ExecutionStopAction extends ExecutionAction {
    readonly type = EXECUTION_STOP;
}

export class ExecutorOutputAction {
    readonly type = EXECUTOR_OUTPUT;

    constructor(public appID: string, public source: string, public message: string) {

    }
}

export abstract class ExecutionStepAction implements Action {
    readonly type;

    constructor(public appID: string, public stepID: string) {

    }
}

export class ExecutionStepFailAction extends ExecutionStepAction {
    readonly type = EXECUTION_STEP_FAIL;
}

export class ExecutionStepStartAction extends ExecutionStepAction {
    readonly type = EXECUTION_STEP_START;
}

export class ExecutionStepCompleteAction extends ExecutionStepAction {
    readonly type = EXECUTION_STEP_COMPLETE;
}

