import {NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {EditorCommonModule} from "../editor-common/editor-common.module";
import {LayoutModule} from "../layout/layout.module";
import {GuidService} from "../services/guid.service";
import {ToolEditorModule} from "../tool-editor/tool-editor.module";
import {ModalService} from "../ui/modal/modal.service";
import {UIModule} from "../ui/ui.module";
import {WorkflowEditorModule} from "../workflow-editor/workflow-editor.module";
import {LayoutTabContentComponent} from "./layout-tab-content/layout-tab-content.component";
import {LayoutComponent} from "./layout/layout.component";
import {LogoComponent} from "./logo/logo.component";
import {AppsPanelComponent} from "./panels/apps-panel/apps-panel.component";
import {MyAppsPanelComponent} from "./panels/my-apps-panel/my-apps-panel.component";
import {NavSearchResultComponent} from "./panels/nav-search-result/nav-search-result.component";
import {PanelContainerComponent} from "./panels/panel-container/panel-container.component";
import {WebWorkerBuilderService} from "./web-worker/web-worker-builder.service";
import {SettingsButtonComponent} from "./workbox/settings-button.component";
import {WorkboxComponent} from "./workbox/workbox.component";

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
        NavSearchResultComponent,
    ],
    exports: [
        LogoComponent,
        LayoutComponent,
    ],
    providers: [
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
