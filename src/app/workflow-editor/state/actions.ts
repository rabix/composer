import {Action} from "@ngrx/store";
import {StepModel} from "cwlts/models";

export class StepUpdateCheckRequestAction implements Action {
    static readonly type = "[Workflow Editor] Step Update Check Request";
    readonly type        = StepUpdateCheckRequestAction.type;

    constructor(public appID: string, public steps: StepModel[]) {
    }
}

export class UpdateStepRevisionMapAction implements Action {
    static readonly type = "[Workflow Editor] Step Revision Map";
    readonly type        = UpdateStepRevisionMapAction.type;

    constructor(public appID: string, public revisionMap: { [stepID: string]: number }) {
    }
}

export class StepRevisionCheckStartAction implements Action {
    static readonly type = "[Workflow Editor] Step Revision Check Start";
    readonly type        = StepRevisionCheckStartAction.type;

    constructor(public appID: string, public stepIDs: string[]) {
    }
}

export class StepRevisionCheckErrorAction implements Action {
    static readonly type = "[Workflow Editor] Step Revision Check Error";
    readonly type        = StepRevisionCheckErrorAction.type;

    constructor(public appID: string, public error: any) {
    }
}


export class StepRevisionCheckCancelAction implements Action {
    static readonly type = "[Workflow Editor] Step Revision Check Cancel";
    readonly type        = StepRevisionCheckCancelAction.type;

    constructor(public appID: string) {
    }
}
