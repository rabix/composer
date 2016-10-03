import {ComponentRegistryFactoryService} from "../workspace/registry/component-registry-factory.service";
import {ContextDirective} from "../../services/context/context.directive";
import {EventHubService} from "../../services/event-hub/event-hub.service";
import {FileRegistry} from "../../services/file-registry.service";
import {FileStateService} from "../../state/file.state.service";
import {MenuBarComponent} from "../menu";
import {ModalService} from "../modal";
import {Observable} from "rxjs/Rx";
import {Component, ViewChild, ViewContainerRef, AfterViewInit} from "@angular/core";
import {UrlValidator} from "../../validators/url.validator";
import {WebWorkerService} from "../../services/webWorker/web-worker.service";
import {ContextService} from "../../services/context/context.service";
import {InputPortService} from "../../services/input-port/input-port.service";
import {PlatformAPI} from "../../services/api/platforms/platform-api.service";
import {LayoutComponent} from "../layout/layout.component";
import {ExpressionInputService} from "../../services/expression-input/expression-input.service";
import {UserPreferencesService} from "../../services/storage/user-preferences.service";
import {DomEventService} from "../../services/dom/dom-event.service";

require("./../../../assets/sass/main.scss");

require("./main.component.scss");

@Component({
    selector: "cottontail",
    template: `
        <ct-layout class="editor-container"></ct-layout>
        <div id="runnix" [class.active]="runnix | async"></div>
        <div #modalAnchor></div>
        <div #contextMenuAnchor></div>
    `,
    directives: [
        MenuBarComponent,
        ContextDirective,
        LayoutComponent,
    ],
    providers: [
        ComponentRegistryFactoryService,
        ContextService,
        EventHubService,
        FileRegistry,
        FileStateService,
        DomEventService,
        ModalService,
        UrlValidator,
        WebWorkerService,
        InputPortService,
        ExpressionInputService,
        PlatformAPI
    ]
})
export class MainComponent implements AfterViewInit {

    private runnix: Observable<boolean>;

    @ViewChild("modalAnchor", {read: ViewContainerRef})
    private modalAnchor: ViewContainerRef;

    @ViewChild("contextMenuAnchor", {read: ViewContainerRef})
    private contextMenuAnchor: ViewContainerRef;

    constructor(private context: ContextService,
                private modal: ModalService) {
        this.runnix = Observable.fromEvent(document, "keyup").map((e: KeyboardEvent) => e.keyCode).bufferCount(10, 1)
            .filter(seq => seq.toString() == [38, 38, 40, 40, 37, 39, 37, 39, 66, 65].toString())
            .map(seq => Observable.of(true).concat(Observable.of(false).delay(3000)))
            .concatAll();
    }

    ngAfterViewInit() {
        this.modal.setAnchor(this.modalAnchor);
        this.context.setAnchor(this.contextMenuAnchor);
    }
}
