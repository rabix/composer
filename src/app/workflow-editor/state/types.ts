export interface AppState {
    workflowEditor: WorkflowEditorModuleState;
}

export interface WorkflowEditorModuleState {
    stepUpdates: StepUpdatesState;
}

export interface StepUpdatesState {
    [appID: string]: StepRevisionMap
}

export interface StepRevisionMap {
    [stepID: string]: number;
}
