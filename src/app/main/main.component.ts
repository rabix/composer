import {Component} from "@angular/core";
import {EditorSidebarComponent} from "../components/editor-sidebar/editor-sidebar.component";
import {WorkspaceComponent} from "../components/workspace/workspace.component";

require("./../../assets/sass/main.scss");
require("./main.component.scss");

@Component({
    selector: "cottontail",
    template: `
        <section class="editor-container">
            <editor-sidebar></editor-sidebar>
            <workspace></workspace>
        </section>
    `,
    directives: [EditorSidebarComponent, WorkspaceComponent]
})
export class MainComponent {

}
