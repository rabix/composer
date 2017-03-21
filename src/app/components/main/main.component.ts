import {Component, ViewContainerRef, ViewEncapsulation} from "@angular/core";
import {Observable} from "rxjs/Rx";
import {DataGatewayService} from "../../core/data-gateway/data-gateway.service";
import {StatusBarService} from "../../layout/status-bar/status-bar.service";
import {ElectronPublicAppService} from "../../platform-providers/public-apps/electron-public-app.service";
import {PublicAppService} from "../../platform-providers/public-apps/public-app.service";
import {SystemService} from "../../platform-providers/system.service";
import {ElectronUserProjectsService} from "../../platform-providers/user-projects/electron-user-projects.service";
import {UserProjectsService} from "../../platform-providers/user-projects/user-projects.service";
import {PlatformAPI} from "../../services/api/platforms/platform-api.service";
import {EventHubService} from "../../services/event-hub/event-hub.service";
import {GuidService} from "../../services/guid.service";
import {LocalDataSourceService} from "../../sources/local/local.source.service";
import {SBPlatformDataSourceService} from "../../sources/sbg/sb-platform.source.service";
import {ContextService} from "../../ui/context/context.service";
import {MarkdownService} from "../../ui/markdown/markdown.service";
import {ModalService} from "../../ui/modal/modal.service";
import {UrlValidator} from "../../validators/url.validator";
import {UserPreferencesService} from "../../services/storage/user-preferences.service";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "cottontail",
    template: `
        <ct-layout></ct-layout>
        <div id="runnix" [class.active]="runnix | async"></div>

        <span data-marker="ready">ready</span>
    `,
    styleUrls: ["./../../../assets/sass/main.scss", "./main.component.scss"],
    providers: [
        EventHubService,
        UrlValidator,
        PlatformAPI,
        SBPlatformDataSourceService,
        MarkdownService,
        ContextService,
        StatusBarService,
        // FIXME: this needs to be handled in a system-specific way
        GuidService,
        LocalDataSourceService,
        {provide: PublicAppService, useClass: ElectronPublicAppService},
        {provide: UserProjectsService, useClass: ElectronUserProjectsService}
    ],
})
export class MainComponent {

    public runnix: Observable<boolean>;

    constructor(modal: ModalService,
                system: SystemService,
                vcRef: ViewContainerRef,
                preferences: UserPreferencesService,
                dataGateway: DataGatewayService,
                statusBarService: StatusBarService) {

        system.boot();

        /**
         * Hack for angular's inability to provide the vcRef to a service with DI.
         * {@link ModalService.rootViewRef}
         */
        modal.setViewContainer(vcRef);


        let process;
        preferences.get("credentials", [])
            .do(_ => process = statusBarService.startProcess("Synchronizing with remote sources..."))
            .flatMap(_ => dataGateway.scan())
            .subscribe(_ => {
                statusBarService.stopProcess(process, "Remote sources synchronized.");

            }, err => {
                statusBarService.stopProcess(process, "Could not synchronize with remote data.");

            });

        dataGateway.scan();

        this.runnix = Observable.fromEvent(document, "keyup").map((e: KeyboardEvent) => e.keyCode).bufferCount(10, 1)
            .filter(seq => seq.toString() === [38, 38, 40, 40, 37, 39, 37, 39, 66, 65].toString())
            .map(seq => Observable.of(true).concat(Observable.of(false).delay(3000)))
            .concatAll();
    }
}
