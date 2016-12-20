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
import {BlockLoaderComponent} from "./app/components/block-loader/block-loader.component";
import {CltEditorComponent} from "./app/components/clt-editor/clt-editor.component";
import {CodeEditorComponent} from "./app/components/code-editor/code-editor.component";
import {AlertComponent} from "./app/components/common/alert.component";
import {FormSectionComponent} from "./app/components/form-section/form-section.component";
import {LocalFilesPanelComponent} from "./app/components/panels/local-files-panel.component";
import {PanelHandleComponent} from "./app/components/panels/panel-handle.component";
import {PanelToolbarComponent} from "./app/components/panels/panel-toolbar.component";
import {SBPublicAppsPanelComponent} from "./app/components/panels/sb-public-apps-panel.component";
import {SBUserProjectsPanelComponent} from "./app/components/panels/sb-user-projects-panel.component";
import {StructurePanelComponent} from "./app/components/panels/structure-panel.component";
import {SettingsComponent} from "./app/components/settings";
import {TabManagerComponent} from "./app/components/tab-manager/tab-manager.component";
import {ToolEditorComponent} from "./app/components/tool-editor/tool-editor.component";
import {ValidationIssuesComponent} from "./app/components/validation-issues/validation-issues.component";
import {ViewModeSwitchComponent} from "./app/components/view-switcher/view-switcher.component";
import {SettingsButtonComponent} from "./app/components/workbox/settings-button.component";
import {WorkflowEditorComponent} from "./app/components/workflow-editor/workflow-editor.component";
import {DockerImageFormComponent} from "./app/components/forms/inputs/forms/docker-image-form.component";
import {BaseCommandFormComponent} from "./app/components/forms/inputs/forms/base-command-form.component";
import {ExpressionEditorSidebarComponent} from "./app/components/sidebar/expression-editor/expression-editor-sidebar.component";
import {ToolHeaderComponent} from "./app/components/tool-editor/tool-header/tool-header.component";
import {CommandLineComponent} from "./app/components/clt-editor/commandline/commandline.component";
import {ExpressionEditorComponent} from "./app/components/sidebar/expression-editor/expression-editor.component";
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
import {CodeEditorDirective} from "./app/directives/code-editor.directive";
import {ToolEditorModule} from "./app/tool-editor/tool-editor.module";
import {CoreModule} from "./app/core/core.module";
import {CWLModule} from "./app/cwl/cwl.module";
import {HintListComponent} from "./app/components/clt-editor/hints/hint-list.component";
import {EditorCommonModule} from "./app/editor-common/editor-common.module";
import {ProjectSelectionModal} from "./app/components/modal/custom/project-selection-modal.component";
import {UserPreferencesService} from "./app/services/storage/user-preferences.service";
import {DomEventService} from "./app/services/dom/dom-event.service";
import {HintListInputComponent} from "./app/components/clt-editor/hints/custom-hint-input.component";

@NgModule({
    providers: [
        FormBuilder,
        ModalService,
        TemplateProviderService,
        UserPreferencesService,
        DomEventService,
    ],
    declarations: [
        AlertComponent,
        BaseCommandFormComponent,
        BlockLoaderComponent,
        CheckboxPromptComponent,
        CltEditorComponent,
        CodeEditorComponent,
        CodeEditorDirective,
        CommandLineComponent,
        ConfirmComponent,
        DockerImageFormComponent,
        ExpressionEditorComponent,
        ExpressionEditorSidebarComponent,
        FormSectionComponent,
        HintListComponent,
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
        ToolEditorComponent,
        ToolHeaderComponent,
        ValidationIssuesComponent,
        ViewModeSwitchComponent,
        WorkboxComponent,
        WorkflowEditorComponent,
        HintListInputComponent
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
        ToolEditorModule
    ],
    bootstrap: [MainComponent]
})
export class AppModule {
}
