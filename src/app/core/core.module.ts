import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {IpcService} from "../services/ipc.service";
import {GuidService} from "../services/guid.service";
import {WebWorkerBuilderService} from "./web-worker/web-worker-builder.service";
import {LogoComponent} from "./logo/logo.component";
import {UIModule} from "../ui/ui.module";
import {ToolEditorModule} from "../tool-editor/tool-editor.module";
import {WorkflowEditorModule} from "../workflow-editor/workflow-editor.module";
import {EditorCommonModule} from "../editor-common/editor-common.module";
import {LayoutModule} from "../layout/layout.module";
import {LayoutTabContentComponent} from "./layout-tab-content/layout-tab-content.component";
import {LayoutComponent} from "./layout/layout.component";
import {ModalService} from "../ui/modal/modal.service";
import {WorkboxComponent} from "./workbox/workbox.component";
import {SettingsButtonComponent} from "./workbox/settings-button.component";
import {AppsPanelComponent} from "./panels/apps-panel/apps-panel.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MyAppsPanelComponent} from "./panels/my-apps-panel/my-apps-panel.component";
import {PanelContainerComponent} from "./panels/panel-container/panel-container.component";

@NgModule({
    entryComponents: [],
    declarations: [
        LayoutComponent,
        LogoComponent,
        LayoutTabContentComponent,
        WorkboxComponent,
        SettingsButtonComponent,
        AppsPanelComponent,
        PanelContainerComponent,
        MyAppsPanelComponent,
    ],
    exports: [
        LogoComponent,
        LayoutComponent,
    ],
    providers: [
        IpcService,
        GuidService,
        WebWorkerBuilderService,
        ModalService,
    ],
    imports: [
        BrowserModule,
        LayoutModule,
        FormsModule,
        ReactiveFormsModule,
        UIModule,
        EditorCommonModule,
        ToolEditorModule,
        WorkflowEditorModule
    ]
})
export class CoreModule {
}
