import {Component, provide, ViewContainerRef} from "@angular/core";
import {WorkspaceComponent} from "../components/workspace/workspace.component";
import {CodeEditorComponent} from "../components/code-editor/code-editor.component";
import {APP_CONFIG, CONFIG} from "../config/app.config";
import {ApiService} from "../services/api/api.service";
import {SocketService} from "../services/api/socket.service";
import {FileApi} from "../services/api/file.api";
import {EditorSidebarComponent} from "../components/editor-sidebar/editor-sidebar.component";
import {ActionPanelComponent} from "../components/action-panel/action-panel.component";

require("./../../assets/sass/main.scss");
require("./main.component.scss");

@Component({
    selector: "cottontail",
    template: `
        <section class="editor-container">
            <editor-sidebar></editor-sidebar>
            <action-panel></action-panel>
            <workspace></workspace>
            
            <code-editor [text]="text"></code-editor>
        </section>
    `,
    directives: [EditorSidebarComponent, WorkspaceComponent, CodeEditorComponent, ActionPanelComponent],
    providers: [provide(APP_CONFIG, {useValue: CONFIG}), ApiService, FileApi, SocketService]
})
export class MainComponent {

    constructor() {

    }
}
