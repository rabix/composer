import {WorkspaceComponent} from "../workspace/workspace.component";
import {ActionPanelComponent} from "../action-panel/action-panel.component";
import {ApiService} from "../../services/api/api.service";
import {AsyncSocketProviderService} from "../file-tree/async-socket-provider.service";
import {ComponentRegistryFactoryService} from "../workspace/registry/component-registry-factory.service";
import {FileApi} from "../../services/api/file.api";
import {FileRegistry} from "../../services/file-registry.service";
import {FileTreeService} from "../file-tree/file-tree.service";
import {APP_CONFIG, CONFIG} from "../../config/app.config";
import {BACKEND_SERVICE} from "../../services/data/providers/data.types";
import {SocketService as NewSocketService} from "../../services/data/providers/socket/socket.service";
import {WorkspaceService} from "../workspace/workspace.service";
import {DataService} from "../../services/data/data.service";
import {SocketService} from "../../services/api/socket.service";
import {provide, Component} from "@angular/core";
import {FileEffects} from "../../store/effects/file.effects";
import {UrlValidator} from "../../validators/url.validator"
import {StateUpdates} from "@ngrx/effects";
import {HTTP_PROVIDERS} from '@angular/http';
require("./../../../assets/sass/main.scss");
require("./main.component.scss");

@Component({
    selector: "cottontail",
    template: `
        <section class="editor-container">
            <action-panel></action-panel>
            <workspace></workspace>
        </section>
    `,
    directives: [WorkspaceComponent, ActionPanelComponent],
    providers: [
        ApiService,
        AsyncSocketProviderService,
        ComponentRegistryFactoryService,
        FileApi,
        FileRegistry,
        FileTreeService,
        provide(APP_CONFIG, {useValue: CONFIG}),
        provide(BACKEND_SERVICE, {useClass: NewSocketService}),
        SocketService,
        WorkspaceService,
        DataService,
        FileEffects,
        StateUpdates,
        UrlValidator,
        HTTP_PROVIDERS
    ]
})
export class MainComponent {

    constructor() {
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

        // fileApi.getDirContent().subscribe((res) => {
        //     console.log(`4. Directory contents`, res);
        // });

        // fileApi.getFileContent('wagner-workflow.json').subscribe(res => {
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
        //
        // fileApi.checkIfFileExists('wagner-workflow.json').subscribe(res => {
        //     console.log(res);
        // }, err => {
        //     console.log(err);
        // })


    }
}
