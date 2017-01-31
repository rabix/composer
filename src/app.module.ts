/// <reference path="../node_modules/typescript/lib/lib.dom.d.ts" />
/// <reference path="../node_modules/typescript/lib/lib.es2017.d.ts" />

import {NgModule} from "@angular/core";
import {HttpModule} from "@angular/http";
import {MainComponent} from "./app/components/main";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule, FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {LayoutComponent} from "./app/components/layout/layout.component";
import {PanelComponent} from "./app/components/panels/panel.component";
import {PanelSwitcherComponent} from "./app/components/panels/panel-switcher.component";
import {PanelContainerComponent} from "./app/components/panels/panel-container.component";
import {WorkboxComponent} from "./app/components/workbox/workbox.component";
import {AlertComponent} from "./app/components/common/alert.component";
import {LocalFilesPanelComponent} from "./app/components/panels/local-files-panel.component";
import {PanelHandleComponent} from "./app/components/panels/panel-handle.component";
import {PanelToolbarComponent} from "./app/components/panels/panel-toolbar.component";
import {SBPublicAppsPanelComponent} from "./app/components/panels/sb-public-apps-panel.component";
import {SBUserProjectsPanelComponent} from "./app/components/panels/sb-user-projects-panel.component";
import {StructurePanelComponent} from "./app/components/panels/structure-panel.component";
import {SettingsComponent} from "./app/components/settings";
import {TabManagerComponent} from "./app/components/tab-manager/tab-manager.component";
import {SettingsButtonComponent} from "./app/components/workbox/settings-button.component";
import {ModalComponent, ModalService} from "./app/components/modal";
import {ConfirmComponent} from "./app/components/modal/common/confirm.component";
import {RadioGroupComponent} from "./app/components/forms/elements/radio-group.component";
import {InputComponent} from "./app/components/forms/elements/input.component";
import {RadioButtonComponent} from "./app/components/forms/elements/radio-button.component";
import {NewFileModalComponent} from "./app/components/modal/custom/new-file-modal.component";
import {TemplateProviderService} from "./app/services/template-provider.service";
import {PromptComponent} from "./app/components/modal/common/prompt.component";
import {CheckboxPromptComponent} from "./app/components/modal/common/checkbox-prompt.component";
import {FileEditorComponent} from "./app/components/file-editor/file-editor.component";
import {ToolEditorModule} from "./app/tool-editor/tool-editor.module";
import {WorkflowEditorModule} from "./app/workflow-editor/workflow-editor.module";
import {WorkflowEditorComponent} from "./app/workflow-editor/workflow-editor.component";
import {CoreModule} from "./app/core/core.module";
import {CWLModule} from "./app/cwl/cwl.module";
import {EditorCommonModule} from "./app/editor-common/editor-common.module";
import {ProjectSelectionModal} from "./app/components/modal/custom/project-selection-modal.component";
import {UserPreferencesService} from "./app/services/storage/user-preferences.service";
import {DomEventService} from "./app/services/dom/dom-event.service";
import {FileRegistryService} from "./app/core/file-registry/file-registry.service";
import {GuidService} from "./app/services/guid.service";
import {IpcService} from "./app/services/ipc.service";
import {PlatformAPI} from "./app/services/api/platforms/platform-api.service";
import {SettingsService} from "./app/services/settings/settings.service";

@NgModule({
    providers: [
        FormBuilder,
        ModalService,
        TemplateProviderService,
        UserPreferencesService,
        DomEventService,
        FileRegistryService,
        GuidService,
        IpcService,
        SettingsService,
        PlatformAPI
    ],
    declarations: [
        AlertComponent,
        CheckboxPromptComponent,
        ConfirmComponent,
        InputComponent,
        LayoutComponent,
        LocalFilesPanelComponent,
        MainComponent,
        ModalComponent,
        NewFileModalComponent,
        PanelComponent,
        PanelContainerComponent,
        PanelHandleComponent,
        PanelSwitcherComponent,
        PanelToolbarComponent,
        ProjectSelectionModal,
        PromptComponent,
        RadioButtonComponent,
        RadioGroupComponent,
        SBPublicAppsPanelComponent,
        SBUserProjectsPanelComponent,
        SettingsButtonComponent,
        SettingsComponent,
        FileEditorComponent,
        StructurePanelComponent,
        TabManagerComponent,
        WorkboxComponent,
        WorkflowEditorComponent
    ],
    entryComponents: [
        CheckboxPromptComponent,
        ConfirmComponent,
        ModalComponent,
        NewFileModalComponent,
        ProjectSelectionModal,
        PromptComponent
    ],
    imports: [
        BrowserModule,
        CoreModule,
        CWLModule,
        EditorCommonModule,
        FormsModule,
        HttpModule,
        ReactiveFormsModule,
        ToolEditorModule,
        WorkflowEditorModule
    ],
    bootstrap: [MainComponent]
})
export class AppModule {
}
