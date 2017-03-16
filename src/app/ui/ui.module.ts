import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DisableFormControlDirective} from "./behaviors/disable-form-control.directive";
import {DragOverDirective} from "./behaviors/drag-and-drop/drag-over.directive";
import {DragDirective} from "./behaviors/drag-and-drop/drag.directive";
import {DropZones} from "./behaviors/drag-and-drop/drop-zones.directive";
import {DropDirective} from "./behaviors/drag-and-drop/drop.directive";
import {CodeEditorComponent} from "./code-editor/code-editor.component";
import {CodePreviewComponent} from "./code-editor/code-preview.component";
import {ContextDirective} from "./context/context.directive";
import {DropDownButtonComponent} from "./dropdown-button/dropdown-button-component";
import {FormPanelComponent} from "./form-panel/form-panel.component";
import {InputFieldComponent} from "./forms/input-field/input-field.component";
import {SearchFieldComponent} from "./forms/search-field/search-field.component";
import {InlineEditorComponent} from "./inline-editor/inline-editor.component";
import {KeyvalueComponent} from "./inline-editor/keyvalue.component";
import {MarkdownDirective} from "./markdown/markdown.directive";
import {MenuItemComponent} from "./menu/menu-item.component";
import {MenuComponent} from "./menu/menu.component";
import {ProgressComponent} from "./progress/progress.component";
import {TabSelectorComponent} from "./tab-selector/tab-selector.component";
import {ToasterComponent} from "./toaster/toaster.component";
import {ToggleComponent} from "./toggle-slider/toggle-slider.component";
import {TooltipContentComponent} from "./tooltip/tooltip-content.component";
import {TooltipDirective} from "./tooltip/tooltip.directive";
import {TreeNodeIconComponent} from "./tree-view-old/tree-node-icon.component";
import {TreeNodeComponent} from "./tree-view/tree-node/tree-node.component";
import {TreeViewComponent} from "./tree-view/tree-view.component";
import {TabComponent} from "./tabs/tab.component";
import {TabsComponent} from "./tabs/tabs.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule
    ],
    exports: [
        CodeEditorComponent,
        ContextDirective,
        DropDownButtonComponent,
        DragDirective,
        DragOverDirective,
        DropDirective,
        DropZones,
        FormPanelComponent,
        ToggleComponent,
        TooltipContentComponent,
        TooltipDirective,
        CodePreviewComponent,
        DisableFormControlDirective,
        MarkdownDirective,
        BlockLoaderComponent,
        TabSelectorComponent,
        SearchFieldComponent,
        TreeViewComponent,
        TreeNodeComponent,
        TreeNodeIconComponent,
        ProgressComponent,
        InlineEditorComponent,
        KeyvalueComponent,
        TabComponent,
        TabsComponent
    ],

    entryComponents: [
        TooltipContentComponent,
    ],

    declarations: [
        TabsComponent,
        KeyvalueComponent,
        TabSelectorComponent,
        BlockLoaderComponent,
        MarkdownDirective,
        DropDownButtonComponent,
        DisableFormControlDirective,
        CodePreviewComponent,
        CodeEditorComponent,
        ContextDirective,
        DragDirective,
        DragOverDirective,
        DropDirective,
        DropZones,
        FormPanelComponent,
        MenuComponent,
        MenuItemComponent,
        TabSelectorComponent,
        ToggleComponent,
        TooltipContentComponent,
        TooltipDirective,
        TreeNodeIconComponent,
        SearchFieldComponent,
        InputFieldComponent,
        TreeViewComponent,
        TreeNodeIconComponent,
        TreeNodeComponent,
        ProgressComponent,
        ToasterComponent,
        InlineEditorComponent,
        TabComponent,
    ]
})
export class UIModule {
}
