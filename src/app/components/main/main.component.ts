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
import {ModalService} from "../../ui/modal/modal.service";
import {UrlValidator} from "../../validators/url.validator";
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
                vcRef: ViewContainerRef,
                dataGateway: DataGatewayService,
                statusBarService: StatusBarService,
                system: SystemService) {

        system.boot();
        /**
         * Hack for angular's inability to provide the vcRef to a service with DI.
         * {@link ModalService.rootViewRef}
         */
        modal.rootViewRef = vcRef;

        const scanning = statusBarService.startProcess("Synchronizing with remote sources...");

        dataGateway.scan().take(1).subscribe(() => {
            statusBarService.stopProcess(scanning, "Remote sources synchronized.");
        }, err => {
            console.warn("Please handle me differently!", err);
            statusBarService.stopProcess(scanning, "Could not synchronize with remote data.");
        });

        this.runnix = Observable.fromEvent(document, "keyup").map((e: KeyboardEvent) => e.keyCode).bufferCount(10, 1)
            .filter(seq => seq.toString() === [38, 38, 40, 40, 37, 39, 37, 39, 66, 65].toString())
            .map(seq => Observable.of(true).concat(Observable.of(false).delay(3000)))
            .concatAll();
    }
}
