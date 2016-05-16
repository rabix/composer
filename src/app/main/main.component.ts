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

    constructor(fileApi: FileApi) {
        /**
         * Example API usage
         */

        // let fileName = new Date().getTime().toString() + '.txt';

        // fileApi.createFile(fileName).subscribe(res => {
        //     console.log(`1. Created ${fileName}:`, res);
        // });
        //
        // fileApi.updateFile(fileName, new Date().toString()).subscribe(res => {
        //     console.log(`2. Updated ${fileName}:`, res);
        // });
        //
        // fileApi.getFileContent(fileName).subscribe((res) => {
        //     console.log(`3. Reading ${fileName} content:`, res);
        // });
        //
        // fileApi.getDirContent().subscribe((res) => {
        //     console.log(`4. Directory contents`, res);
        // });
        //
        // fileApi.getFileContent('').subscribe(res => {
        //     console.log(res);
        // }, err => {
        //     console.log(err);
        // });
        //
        // fileApi.getFileContent('does not exist').subscribe(res => {
        //     console.log(res);
        // }, err => {
        //     console.log(err);
        // });


    }
}
