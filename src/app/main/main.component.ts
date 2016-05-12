import {Component, provide} from "@angular/core";
import {EditorSidebarComponent} from "../components/editor-sidebar/editor-sidebar.component";
import {WorkspaceComponent} from "../components/workspace/workspace.component";
import {CodeEditorComponent} from "../components/code-editor/code-editor.component";
import {APP_CONFIG, CONFIG} from "../config/app.config";
import {ApiService} from "../services/api/api.service";

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
    directives: [EditorSidebarComponent, WorkspaceComponent, CodeEditorComponent],
    providers: [provide(APP_CONFIG, {useValue: CONFIG}), ApiService]
})
export class MainComponent {

    constructor(api: ApiService) {
    }
}
