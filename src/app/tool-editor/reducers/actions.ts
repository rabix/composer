import {Action} from "@ngrx/store";
import {AppTestData} from "./index";

export class InputTestValueChangeAction implements Action {
    static readonly type = "TOOL_EDITOR_INPUT_TEST_VALUE_CHANGE";
                    type = InputTestValueChangeAction.type;

    constructor(public appID: string, public inputID: string, public value: any) {
    }
}

export class AppMockValuesChange implements Action {
    static readonly type = "TOOL_EDITOR_APP_MOCK_VALUES_CHANGE";
    readonly type        = AppMockValuesChange.type;

    constructor(public appID: string, public value: AppTestData) {
    }
}

export class InputIDChangeAction implements Action {
    static readonly type = "TOOL_EDITOR_INPUT_ID_CHANGE";
    readonly type        = InputIDChangeAction.type;

    constructor(public appID: string, public oldID: string, public newID: string) {
    }
}


export class InputTypeChangeAction implements Action {
    static readonly type = "TOOL_EDITOR_INPUT_TYPE_CHANGE";
    readonly type        = InputTypeChangeAction.type;

    constructor(public appID: string) {
    }
}

export class InputRemoveAction implements Action {
    static readonly type = "TOOL_EDITOR_INPUT_REMOVE";
    readonly type        = InputRemoveAction.type;

    constructor(public appID: string, public inputID: string) {
    }
}

export class LoadTestJobAction implements Action {
    static readonly type = "TOOL_EDITOR_TEST_JOB_REQUEST";
    readonly type        = LoadTestJobAction.type;

    constructor(public appID: string) {

    }
}
