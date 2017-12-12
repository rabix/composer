import {InjectionToken} from "@angular/core";
import {CommandLineToolModel, WorkflowModel} from "cwlts/models";
import {AppEditorBase} from "../../editor-common/app-editor-base/app-editor-base";

export const APP_MODEL = new InjectionToken("appModel");

export function appModelFactory(editor: AppEditorBase): WorkflowModel | CommandLineToolModel {
    return editor.dataModel;
}
