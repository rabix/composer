import {Component, ViewContainerRef, ViewEncapsulation} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {AuthService} from "../../auth/auth.service";
import {GlobalService} from "../../core/global/global.service";
import {SystemService} from "../../platform-providers/system.service";
import {IpcService} from "../../services/ipc.service";
import {JavascriptEvalService} from "../../services/javascript-eval/javascript-eval.service";
import {ContextService} from "../../ui/context/context.service";
import {ModalService} from "../../ui/modal/modal.service";
import {UrlValidator} from "../../validators/url.validator";
import {ElectronProxyService} from "../../native/proxy/electron-proxy.service";
import {OpenExternalFileService} from "../../core/magnet-link/magnet-link.service";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-cottontail",
    template: `
        <ct-layout data-test="layout"></ct-layout>
        <div id="runnix" [class.active]="runnix | async"></div>

    `,
    styleUrls: ["./../../../assets/sass/main.scss", "./main.component.scss"],
    providers: [
        UrlValidator,
        ContextService
    ],
})
export class MainComponent {

    public runnix: Observable<boolean>;

    constructor(modal: ModalService,
                system: SystemService,
                vcRef: ViewContainerRef,
                auth: AuthService,
                ipc: IpcService,
                global: GlobalService,
                electron: ElectronProxyService,
                // DON'T REMOVE THIS PLEASE I KNOW IT DOESN'T HAVE ANY USAGES
                openExternalFileService: OpenExternalFileService,
                js: JavascriptEvalService) {

        system.boot();

        // When we first get active credentials (might be undefined if no user is active), sync data with the platform
        auth.getActive().take(1).filter(creds => {
            // Stop if there are either no credentials, or we have the --no-fetch-on-start argument passed to the chromium cli
            // The cli arg is a useful testing facility.
            return creds && electron.getRemote().process.argv.indexOf("--no-fetch-on-start") === -1;
        }).subscribe(() => {
            global.reloadPlatformData();
        });

        /**
         * Hack for angular's inability to provide the vcRef to a service with DI.
         * {@link ModalService.rootViewRef}
         */
        modal.setViewContainer(vcRef);

        /**
         * This has to be after  modal.setViewContainer(vcRef) in order to show the modal.
         */
        if (electron.getRemote().process.argv.indexOf("--no-update-check") === -1) {
            global.checkForPlatformUpdates().catch(console.warn);
        }

        ipc.watch("accelerator", "checkForPlatformUpdates").subscribe(() => {
            global.checkForPlatformUpdates(true).catch(console.warn);
        });

        ipc.watch("accelerator", "showAboutPageModal").subscribe(() => {
            global.showAboutPageModal();
        });

        this.runnix = Observable.fromEvent(document, "keyup").map((e: KeyboardEvent) => e.keyCode).bufferCount(10, 1)
            .filter(seq => seq.toString() === [38, 38, 40, 40, 37, 39, 37, 39, 66, 65].toString())
            .map(seq => Observable.of(true).concat(Observable.of(false).delay(3000)))
            .concatAll();
    }
}
