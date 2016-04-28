import {EditorSidebarItemComponent} from "./editor-sidebar-item/editor-sidebar-item.component";
import {WorkspaceComponent} from "../../decorators/workspace-component.annotation";
import {Component, ComponentFactory} from "angular2/core";

require("./editor-sidebar.component.scss");

@Component({

    selector: "editor-sidebar",
    directives: [EditorSidebarItemComponent],
    template: `
            <nav>
                <editor-sidebar-item title="Project" icon="files-o"></editor-sidebar-item>
                <editor-sidebar-item title="Apps" icon="sitemap"></editor-sidebar-item>
                <editor-sidebar-item title="Settings" icon="cog"></editor-sidebar-item>
            </nav>
    `
})
export class EditorSidebarComponent {

}
