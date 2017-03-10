import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {FormBuilder, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {ModalService} from "./components/modal/modal.service";
import {TemplateProviderService} from "./services/template-provider.service";
import {UserPreferencesService} from "./services/storage/user-preferences.service";
import {DomEventService} from "./services/dom/dom-event.service";
import {GuidService} from "./services/guid.service";
import {IpcService} from "./services/ipc.service";
import {SettingsService} from "./services/settings/settings.service";
import {PlatformAPI} from "./services/api/platforms/platform-api.service";
import {AlertComponent} from "./components/common/alert.component";
import {CheckboxPromptComponent} from "./components/modal/common/checkbox-prompt.component";
import {ConfirmComponent} from "./components/modal/common/confirm.component";
import {InputComponent} from "./components/forms/elements/input.component";
import {LayoutComponent} from "./components/layout/layout.component";
import {LocalFilesPanelComponent} from "./components/panels/local-files-panel.component";
import {MainComponent} from "./components/main/main.component";
import {ModalComponent} from "./components/modal/modal.component";
import {NewFileModalComponent} from "./components/modal/custom/new-file-modal.component";
import {PanelComponent} from "./components/panels/panel.component";
import {PanelContainerComponent} from "./components/panels/panel-container.component";
import {PanelHandleComponent} from "./components/panels/panel-handle.component";
import {PanelSwitcherComponent} from "./components/panels/panel-switcher.component";
import {PanelToolbarComponent} from "./components/panels/panel-toolbar.component";
import {ProjectSelectionModal} from "./components/modal/custom/project-selection-modal.component";
import {PromptComponent} from "./components/modal/common/prompt.component";
import {RadioButtonComponent} from "./components/forms/elements/radio-button.component";
import {RadioGroupComponent} from "./components/forms/elements/radio-group.component";
import {SBPublicAppsPanelComponent} from "./components/panels/sb-public-apps-panel.component";
import {SBUserProjectsPanelComponent} from "./components/panels/sb-user-projects-panel.component";
import {SettingsButtonComponent} from "./components/workbox/settings-button.component";
import {SettingsComponent} from "./components/settings/settings.component";
import {FileEditorComponent} from "./components/file-editor/file-editor.component";
import {StructurePanelComponent} from "./components/panels/structure-panel.component";
import {WorkboxComponent} from "./components/workbox/workbox.component";
import {CoreModule} from "./core/core.module";
import {CWLModule} from "./cwl/cwl.module";
import {EditorCommonModule} from "./editor-common/editor-common.module";
import {ToolEditorModule} from "./tool-editor/tool-editor.module";
import {WorkflowEditorModule} from "./workflow-editor/workflow-editor.module";
import {UpdateStepModal} from "./components/modal/custom/update-step-modal.component";

@NgModule({
    providers: [
        FormBuilder,
        ModalService,
        TemplateProviderService,
        UserPreferencesService,
        DomEventService,
        GuidService,
        IpcService,
        SettingsService,
        PlatformAPI,
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
        WorkboxComponent,
        UpdateStepModal,
    ],
    entryComponents: [
        CheckboxPromptComponent,
        ConfirmComponent,
        ModalComponent,
        NewFileModalComponent,
        ProjectSelectionModal,
        PromptComponent,
        UpdateStepModal
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
