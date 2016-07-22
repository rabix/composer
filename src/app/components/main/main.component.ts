import {ApiService} from "../../services/api/api.service";
import {APP_CONFIG, CONFIG} from "../../config/app.config";
import {BACKEND_SERVICE} from "../../services/data/providers/data.types";
import {ComponentRegistryFactoryService} from "../workspace/registry/component-registry-factory.service";
import {EventHubService} from "../../services/event-hub/event-hub.service";
import {FileApi} from "../../services/api/file.api";
import {FileRegistry} from "../../services/file-registry.service";
import {FileStateService} from "../../state/file.state.service";
import {FileTreeService} from "../file-tree/file-tree.service";
import {HTTP_PROVIDERS} from "@angular/http";
import {MenuBarComponent} from "../menu/menu-bar.component";
import {ModalService} from "../modal/modal.service";
import {Observable} from "rxjs/Rx";
import {provide, Component, ViewChild, ViewContainerRef, AfterViewInit} from "@angular/core";
import {SocketService as NewSocketService} from "../../services/data/providers/socket/socket.service";
import {SocketService} from "../../services/api/socket.service";
import {UrlValidator} from "../../validators/url.validator";
import {WorkspaceComponent} from "../workspace/workspace.component";
import {WorkspaceService} from "../workspace/workspace.service";

require("./../../../assets/sass/main.scss");
require("./main.component.scss");

@Component({
    selector: "cottontail",
    template: `
        <section class="editor-container">
            <ct-menu-bar></ct-menu-bar>
            <workspace></workspace>
        </section>
        <div id="runnix" [class.active]="runnix | async"></div>
        <div #modalAnchor></div>
    `,
    directives: [
        MenuBarComponent,
        WorkspaceComponent,

    ],
    providers: [
        ApiService,
        ComponentRegistryFactoryService,
        EventHubService,
        FileApi,
        FileRegistry,
        FileStateService,
        FileTreeService,
        HTTP_PROVIDERS,
        ModalService,
        provide(APP_CONFIG, {useValue: CONFIG}),
        provide(BACKEND_SERVICE, {useClass: NewSocketService}),
        SocketService,
        UrlValidator,
        WorkspaceService,
    ]
})
export class MainComponent implements AfterViewInit {

    private runnix: Observable<boolean>;

    @ViewChild("modalAnchor", {read: ViewContainerRef})
    private modalAnchor: ViewContainerRef;

    constructor(private modal: ModalService) {

        this.runnix = Observable.fromEvent(document, "keyup").map(e => e.keyCode).bufferCount(10, 1)
            .filter(seq => seq.toString() == [38, 38, 40, 40, 37, 39, 37, 39, 66, 65].toString())
            .map(seq => Observable.of(true).concat(Observable.of(false).delay(3000)))
            .concatAll();
    }

    ngAfterViewInit() {
        this.modal.setAnchor(this.modalAnchor);
    }
}
