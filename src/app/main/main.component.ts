import {Component} from "@angular/core";
import {EditorSidebarComponent} from "../components/editor-sidebar/editor-sidebar.component";
import {WorkspaceComponent} from "../components/workspace/workspace.component";
import {CodeEditorComponent} from "../components/code-editor/code-editor.component";

require("./../../assets/sass/main.scss");
require("./main.component.scss");

@Component({
    selector: "cottontail",
    template: `
        <section class="editor-container">
            <editor-sidebar></editor-sidebar>
            <workspace></workspace>
            
            <!--<code-editor [text]="text"></code-editor>-->
        </section>
    `,
    directives: [EditorSidebarComponent, WorkspaceComponent, CodeEditorComponent]
})
export class MainComponent {

}
