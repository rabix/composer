import {Component, provide, ViewContainerRef} from "@angular/core";
import {WorkspaceComponent} from "../components/workspace/workspace.component";
import {CodeEditorComponent} from "../components/code-editor/code-editor.component";
import {APP_CONFIG, CONFIG} from "../config/app.config";
import {ApiService} from "../services/api/api.service";
import {SocketService} from "../services/api/socket.service";
import {FileApi} from "../services/api/file.api";
import {FilePath} from "../services/api/api-response-types";
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
            
            <!--<code-editor [text]="text"></code-editor>-->
        </section>
    `,
    directives: [EditorSidebarComponent, WorkspaceComponent, CodeEditorComponent, ActionPanelComponent],
    providers: [provide(APP_CONFIG, {useValue: CONFIG}), ApiService, FileApi, SocketService]
})
export class MainComponent {

    constructor(private fileApi: FileApi) {
        fileApi.getDirContent().subscribe((paths) => {
            console.log("1. Content is ");
        });
        fileApi.getDirContent().subscribe((content) => {
            console.log("2. Content is ", content);
        });
        fileApi.getDirContent().subscribe((content) => {
            console.log("3. Content is ", content);
        });

        setTimeout(function(){
            fileApi.getDirContent().subscribe((content) => {
                console.log("4. Content is ", content);
            });
            fileApi.getDirContent().subscribe((content) => {
                console.log("5. Content is ", content);
            });

        }, 5000)
    }
}
