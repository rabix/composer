import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormPanelComponent} from "./elements/form-panel.component";
import {TooltipDirective} from "./ui/tooltip/tooltip.directive";
import {TooltipContentComponent} from "./ui/tooltip/tooltip-content.component";
import {CodeEditorComponent} from "./ui/code-editor/code-editor.component";
import {IpcService} from "../services/ipc.service";
import {GuidService} from "../services/guid.service";
import {CodePreviewComponent} from "./ui/code-editor/code-preview.component";
import {TreeViewComponent} from "./ui/tree-view/tree-view.component";
import {TreeNodeComponent} from "./ui/tree-view/tree-node.component";
import {TreeNodeIconComponent} from "./ui/tree-view/tree-node-icon.component";
import {MenuItemComponent} from "./ui/menu/menu-item.component";
import {MenuComponent} from "./ui/menu/menu.component";
import {ContextDirective} from "./ui/context/context.directive";
import {ContextService} from "./ui/context/context.service";
import {MdProgressBarModule} from "@angular2-material/progress-bar";

@NgModule({
    entryComponents: [
        TooltipContentComponent,

        // Menu
        MenuItemComponent,
        MenuComponent,

        // Context
        // ContextDirective,
    ],
    declarations: [
        // Code Editor Components
        CodeEditorComponent,
        CodePreviewComponent,

        // Form Components
        FormPanelComponent,

        // Tree Components
        TreeViewComponent,
        TreeNodeComponent,
        TreeNodeIconComponent,

        // Tooltip
        TooltipContentComponent,
        TooltipDirective,

        // Menu
        MenuItemComponent,
        MenuComponent,

        // Context
        ContextDirective

    ],
    exports: [
        // Code Editor
        CodeEditorComponent,
        CodePreviewComponent,

        // Forms
        FormPanelComponent,

        // Tooltip
        TooltipContentComponent,

        // Tree
        TreeViewComponent,

        // Directives
        TooltipDirective,

        // Menu
        MenuItemComponent,
        MenuComponent,

        // Context
        ContextDirective,
    ],
    providers: [
        IpcService,
        GuidService,
        ContextService,

    ],
    imports: [BrowserModule, MdProgressBarModule]
})
export class CoreModule {

}
