import {InjectionToken} from "@angular/core";
import {AppEditorBase} from "../app-editor-base/app-editor-base";
import {AppHelper} from "../../core/helpers/AppHelper";

export const AppInfoToken = new InjectionToken("appInfoToken");

export interface AppInfo {
    id: string;
    isLocal: boolean;
}

export function appInfoFactory(editor: AppEditorBase): AppInfo {
    return {
        id: editor.tabData.id,
        isLocal: AppHelper.isLocal(editor.tabData.id)
    }
}
