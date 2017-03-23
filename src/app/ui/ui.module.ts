import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AutoCompleteComponent} from "./auto-complete/auto-complete.component";
import {DisableFormControlDirective} from "./behaviors/disable-form-control.directive";
import {DragOverDirective} from "./behaviors/drag-and-drop/drag-over.directive";
import {DragDirective} from "./behaviors/drag-and-drop/drag.directive";
import {DropZones} from "./behaviors/drag-and-drop/drop-zones.directive";
import {DropDirective} from "./behaviors/drag-and-drop/drop.directive";
import {BlockLoaderComponent} from "./block-loader/block-loader.component";
import {CodeEditorComponent} from "./code-editor-new/code-editor.component";
import {CodeEditorXComponent} from "./code-editor/code-editor.component";
import {CodePreviewComponent} from "./code-editor/code-preview.component";
import {ContextDirective} from "./context/context.directive";
import {DropDownButtonComponent} from "./dropdown-button/dropdown-button-component";
import {DropDownMenuComponent} from "./dropdown-button/dropdown-menu.component";
import {FormPanelComponent} from "./form-panel/form-panel.component";
import {InputFieldComponent} from "./forms/input-field/input-field.component";
import {SearchFieldComponent} from "./forms/search-field/search-field.component";
import {InlineEditorComponent} from "./inline-editor/inline-editor.component";
import {KeyvalueComponent} from "./inline-editor/keyvalue.component";
import {MarkdownDirective} from "./markdown/markdown.directive";
import {MenuItemComponent} from "./menu/menu-item.component";
import {MenuComponent} from "./menu/menu.component";
import {ModalComponent} from "./modal/modal.component";
import {ProgressComponent} from "./progress/progress.component";
import {TabSelectorEntryComponent} from "./tab-selector/tab-selector-entry/tab-selector-entry.component";
import {TabSelectorComponent} from "./tab-selector/tab-selector.component";
import {TabComponent} from "./tabs/tab.component";
import {ToasterComponent} from "./toaster/toaster.component";
import {ToggleComponent} from "./toggle-slider/toggle-slider.component";
import {TooltipContentComponent} from "./tooltip/tooltip-content.component";
import {TooltipDirective} from "./tooltip/tooltip.directive";
import {TreeNodeIconComponent} from "./tree-view-old/tree-node-icon.component";
import {TreeNodeComponent} from "./tree-view/tree-node/tree-node.component";
import {TreeViewComponent} from "./tree-view/tree-view.component";
import {TabsComponent} from "./tabs/tabs.component";
import {LineLoaderComponent} from "./line-loader/line-loader.component";
import {ConfirmComponent} from "./modal/common/confirm.component";
import {PromptComponent} from "./modal/common/prompt.component";
import {SelectComponent} from "./auto-complete/select/select.component";
import {MultilangCodeEditorComponent} from "./code-editor/multilang-code-editor.component";
import {InputComponent} from "./input/input.component";
import {RadioButtonComponent} from "./radio-button/radio-button.component";
import {RadioGroupComponent} from "./radio-button/radio-group.component";
import {NewFileModalComponent} from "./modal/custom/new-file-modal.component";
import {ProjectSelectionModal} from "./modal/custom/project-selection-modal.component";
import {CheckboxPromptComponent} from "./modal/common/checkbox-prompt.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    exports: [
        AutoCompleteComponent,
        BlockLoaderComponent,
        LineLoaderComponent,
        CodeEditorComponent,
        CodeEditorXComponent,
        CodePreviewComponent,
        ContextDirective,
        DisableFormControlDirective,
        DragDirective,
        DragOverDirective,
        DropDirective,
        DropDownButtonComponent,
        DropZones,
        FormPanelComponent,
        InlineEditorComponent,
        KeyvalueComponent,
        MarkdownDirective,
        ModalComponent,
        ProgressComponent,
        SearchFieldComponent,
        TabComponent,
        TabsComponent,
        TabSelectorComponent,
        TabSelectorEntryComponent,
        ToggleComponent,
        TooltipContentComponent,
        TooltipDirective,
        TreeNodeComponent,
        TreeNodeIconComponent,
        TreeViewComponent,
    ],

    entryComponents: [
        DropDownButtonComponent,
        DropDownMenuComponent,
        ModalComponent,
        TooltipContentComponent,
        ConfirmComponent,
        CheckboxPromptComponent,
        PromptComponent,
        MultilangCodeEditorComponent
    ],

    declarations: [
        AutoCompleteComponent,
        LineLoaderComponent,
        BlockLoaderComponent,
        CodeEditorComponent,
        CodePreviewComponent,
        CodeEditorXComponent,
        ModalComponent,
        ContextDirective,
        ConfirmComponent,
        CheckboxPromptComponent,
        DisableFormControlDirective,
        DragDirective,
        DragOverDirective,
        DropDirective,
        DropDownButtonComponent,
        DropDownMenuComponent,
        DropZones,
        FormPanelComponent,
        InlineEditorComponent,
        InputFieldComponent, // @fixme remove this component?
        InputComponent,
        KeyvalueComponent,
        MarkdownDirective,
        MenuComponent,
        MenuItemComponent,
        ModalComponent,
        MultilangCodeEditorComponent,
        NewFileModalComponent,
        ProgressComponent,
        ProjectSelectionModal,
        PromptComponent,
        RadioButtonComponent,
        RadioGroupComponent,
        SearchFieldComponent,
        SelectComponent,
        TabComponent,
        TabsComponent,
        TabSelectorComponent,
        TabSelectorComponent,
        TabSelectorEntryComponent,
        ToasterComponent,
        ToggleComponent,
        TooltipContentComponent,
        TooltipDirective,
        TreeNodeComponent,
        TreeNodeIconComponent,
        TreeNodeIconComponent,
        TreeViewComponent
    ]
})
export class UIModule {

}
