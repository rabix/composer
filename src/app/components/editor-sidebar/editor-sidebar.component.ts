import {EditorSidebarItemComponent} from "./editor-sidebar-item/editor-sidebar-item.component";
import {Component} from "@angular/core";
import {HTTP_PROVIDERS} from '@angular/http';
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
    `,
    providers: [HTTP_PROVIDERS]
})
export class EditorSidebarComponent {

}
