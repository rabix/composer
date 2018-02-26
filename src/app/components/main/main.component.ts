import {Component, ViewContainerRef, ViewEncapsulation} from "@angular/core";
import {AuthService} from "../../auth/auth.service";
import {GlobalService} from "../../core/global/global.service";
import {OpenExternalFileService} from "../../core/open-external-file/open-external-file.service";
import {ElectronProxyService} from "../../native/proxy/electron-proxy.service";
import {SystemService} from "../../platform-providers/system.service";
import {IpcService} from "../../services/ipc.service";
import {JavascriptEvalService} from "../../services/javascript-eval/javascript-eval.service";
import {ContextService} from "../../ui/context/context.service";
import {ModalService} from "../../ui/modal/modal.service";
import {DomEventService} from "../../services/dom/dom-event.service";
import {filter, take} from "rxjs/operators";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-cottontail",
    template: `
        <ct-layout data-test="layout"></ct-layout>
    `,
    styleUrls: ["./main.component.scss"],
    providers: [
        ContextService
    ],
})
export class MainComponent {

    constructor(modal: ModalService,
                domService: DomEventService,
                system: SystemService,
                vcRef: ViewContainerRef,
                auth: AuthService,
                ipc: IpcService,
                global: GlobalService,
                electron: ElectronProxyService,
                openExternalFileService: OpenExternalFileService,
                // DON'T REMOVE THIS PLEASE I KNOW IT DOESN'T HAVE ANY USAGES
                js: JavascriptEvalService) {

        system.boot();

        // Prevent dropping files on document to avoid window navigation
        domService.preventDropEventOnDocument();

        openExternalFileService.watchDeepLinks();

        // When we first get active credentials (might be undefined if no user is active), sync data with the platform
        auth.getActive().pipe(
            take(1),
            filter(creds => {
                // Stop if there are either no credentials, or we have the --no-fetch-on-start argument passed to the chromium cli
                // The cli arg is a useful testing facility.
                return creds && electron.getRemote().process.argv.indexOf("--no-fetch-on-start") === -1;
            })
        ).subscribe(() => {
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
    }
}
