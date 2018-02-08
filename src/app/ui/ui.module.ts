import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TrimValueAccessor} from "./accessors/trim-value-accessor/trim-value-accessor.directive";
import {AutoCompleteComponent} from "./auto-complete/auto-complete.component";
import {SelectComponent} from "./auto-complete/select/select.component";
import {DisableFormControlDirective} from "./behaviors/disable-form-control.directive";
import {DragOverDirective} from "./behaviors/drag-and-drop/drag-over.directive";
import {DragDirective} from "./behaviors/drag-and-drop/drag.directive";
import {DropZones} from "./behaviors/drag-and-drop/drop-zones.directive";
import {DropDirective} from "./behaviors/drag-and-drop/drop.directive";
import {MouseClickDirective} from "./behaviors/mouse-click.directive";
import {BlockLoaderComponent} from "./block-loader/block-loader.component";
import {CircularLoaderComponent} from "./circular-loader/circular-loader.component";
import {CodeEditorComponent} from "./code-editor-new/code-editor.component";
import {CodeEditorXComponent} from "./code-editor/code-editor.component";
import {CodePreviewComponent} from "./code-editor/code-preview.component";
import {MultilangCodeEditorComponent} from "./code-editor/multilang-code-editor.component";
import {ContextDirective} from "./context/context.directive";
import {DropDownButtonComponent} from "./dropdown-button/dropdown-button-component";
import {DropDownMenuComponent} from "./dropdown-button/dropdown-menu.component";
import {FormPanelComponent} from "./form-panel/form-panel.component";
import {InputFieldComponent} from "./forms/input-field/input-field.component";
import {SearchFieldComponent} from "./forms/search-field/search-field.component";
import {GenericDropDownMenuComponent} from "./generic-drop-down-menu/generic-drop-down-menu.component";
import {InlineEditorComponent} from "./inline-editor/inline-editor.component";
import {KeyvalueComponent} from "./inline-editor/keyvalue.component";
import {InputComponent} from "./input/input.component";
import {LineLoaderComponent} from "./line-loader/line-loader.component";
import {LoaderButtonContentComponent} from "./loader-button/loader-button-content.component";
import {MarkdownComponent} from "./markdown/markdown.component";
import {MenuItemComponent} from "./menu/menu-item.component";
import {MenuComponent} from "./menu/menu.component";
import {CheckboxPromptComponent} from "./modal/common/checkbox-prompt.component";
import {ConfirmComponent} from "./modal/common/confirm.component";
import {ErrorComponent} from "./modal/common/error.component";
import {PromptComponent} from "./modal/common/prompt.component";
import {ProjectSelectionModal} from "./modal/custom/project-selection-modal.component";
import {ModalComponent} from "./modal/modal.component";
import {ProgressComponent} from "./progress/progress.component";
import {RadioButtonComponent} from "./radio-button/radio-button.component";
import {RadioGroupComponent} from "./radio-button/radio-group.component";
import {TabSelectorEntryComponent} from "./tab-selector/tab-selector-entry/tab-selector-entry.component";
import {TabSelectorComponent} from "./tab-selector/tab-selector.component";
import {TabComponent} from "./tabs/tab.component";
import {TabsComponent} from "./tabs/tabs.component";
import {ToggleSliderComponent} from "./toggle-slider/toggle-slider.component";
import {TooltipContentComponent} from "./tooltip/tooltip-content.component";
import {TooltipDirective} from "./tooltip/tooltip.directive";
import {TreeNodeLabelDirective} from "./tree-view/tree-node-label-directive";
import {TreeNodeComponent} from "./tree-view/tree-node/tree-node.component";
import {TreeViewComponent} from "./tree-view/tree-view.component";
import {NativeFileBrowserFormFieldComponent} from "./native-file-browser-form-field/native-file-browser-form-field.component";
import {BlankStateComponent} from "./blank-state/blank-state.component";
import {AutofocusDirective} from "./autofocus/autofocus.directive";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    exports: [
        AutoCompleteComponent,
        AutofocusDirective,
        BlankStateComponent,
        BlockLoaderComponent,
        LineLoaderComponent,
        CodeEditorComponent,
        CodeEditorXComponent,
        CodePreviewComponent,
        CircularLoaderComponent,
        ContextDirective,
        DisableFormControlDirective,
        DragDirective,
        DragOverDirective,
        DropDirective,
        DropDownButtonComponent,
        GenericDropDownMenuComponent,
        DropZones,
        FormPanelComponent,
        InlineEditorComponent,
        KeyvalueComponent,
        MarkdownComponent,
        ModalComponent,
        ProgressComponent,
        SearchFieldComponent,
        TabComponent,
        TabsComponent,
        TabSelectorComponent,
        TabSelectorEntryComponent,
        ToggleSliderComponent,
        TooltipContentComponent,
        TooltipDirective,
        TreeNodeComponent,
        TreeNodeLabelDirective,
        TreeViewComponent,
        MouseClickDirective,
        TrimValueAccessor,
        LoaderButtonContentComponent,
        NativeFileBrowserFormFieldComponent
    ],

    entryComponents: [
        DropDownButtonComponent,
        DropDownMenuComponent,
        ErrorComponent,
        ModalComponent,
        TooltipContentComponent,
        ConfirmComponent,
        CheckboxPromptComponent,
        CodeEditorComponent,
        PromptComponent,
        MultilangCodeEditorComponent,
        MenuComponent
    ],

    declarations: [
        AutoCompleteComponent,
        BlankStateComponent,
        BlockLoaderComponent,
        CheckboxPromptComponent,
        CircularLoaderComponent,
        CodeEditorComponent,
        CodeEditorXComponent,
        CodePreviewComponent,
        ConfirmComponent,
        ContextDirective,
        DisableFormControlDirective,
        DragDirective,
        DragOverDirective,
        DropDirective,
        DropDownButtonComponent,
        DropDownMenuComponent,
        DropZones,
        ErrorComponent,
        FormPanelComponent,
        GenericDropDownMenuComponent,
        InlineEditorComponent,
        InputComponent,
        InputFieldComponent, // @fixme remove this component?
        KeyvalueComponent,
        LineLoaderComponent,
        LoaderButtonContentComponent,
        MarkdownComponent,
        MenuComponent,
        MenuItemComponent,
        ModalComponent,
        ModalComponent,
        MouseClickDirective,
        MultilangCodeEditorComponent,
        NativeFileBrowserFormFieldComponent,
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
        ToggleSliderComponent,
        TooltipContentComponent,
        TooltipDirective,
        TreeNodeComponent,
        TreeNodeLabelDirective,
        TreeViewComponent,
        TrimValueAccessor,
        AutofocusDirective,
    ]
})
export class UIModule {

}
