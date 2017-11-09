import {Injectable} from "@angular/core";
import {WorkboxService} from "../workbox/workbox.service";
import {PlatformRepositoryService} from "../../repository/platform-repository.service";
import {AuthService} from "../../auth/auth.service";
import {IpcService} from "../../services/ipc.service";
import {Observable} from "rxjs/Observable";
import {AppHelper} from "../helpers/AppHelper";
import {AuthCredentials} from "../../auth/model/auth-credentials";
import {ModalService} from "../../ui/modal/modal.service";
import {PlatformCredentialsModalComponent} from "../modals/platform-credentials-modal/platform-credentials-modal.component";
import {GlobalService} from "../global/global.service";
import {NotificationBarService} from "../../layout/notification-bar/notification-bar.service";

@Injectable()
export class OpenExternalFileService {

    openingMagnetLinkInProgress = false;

    constructor(workbox: WorkboxService, platform: PlatformRepositoryService, auth: AuthService, ipc: IpcService,
                modalService: ModalService, global: GlobalService, notificationBar: NotificationBarService) {

        ipc.watch("deepLinkingHandler").filter((a) => !!a).subscribe((data) => {

            if (this.openingMagnetLinkInProgress || !(data.username && data.appId && data.url)) {
                return;
            }

            this.openingMagnetLinkInProgress = true;

            const username = data.username;
            const appId = data.appId;
            const url = data.url;
            const isPublic = data.isPublicApp || false;

            const projectSlug = appId.split("/").splice(0, 2).join("/");

            auth.getCredentials().take(1).switchMap((cred: AuthCredentials[]) => {

                // Check if user exists in the credentials list
                const user = cred.find(c => c.user.username === username && c.url === url);

                if (user) {
                    // If there is a user, set user to be the active one
                    return Observable.fromPromise(auth.setActiveCredentials(user)).do(() => {
                        // Reload data and tabs
                        global.reloadPlatformData();
                        workbox.forceReloadTabs();
                    });

                } else {
                    // If there is no user, open modal to add a connection
                    return Observable.fromPromise(modalService.wrapPromise((resolve) => {
                        const modal = modalService.fromComponent(PlatformCredentialsModalComponent, "Add Connection");

                        modal.user = {username: username};
                        modal.platform = url;
                        modal.forceSetActiveInTokenOnlyMode = true;
                        modal.tokenOnly = true;

                        modal.submit.take(1).subscribe(() => {
                            resolve();
                            modalService.close();
                        });

                    }));
                }
            }).switchMap(() => {
                // Wait until user becomes the active one
                return auth.getActive().filter((a) => {
                    if (!a) {
                        return false;
                    }

                    return a.user.username === username && a.url === url;
                }).take(1);
            }).switchMap(() => {
                return Observable.combineLatest(platform.getApp(appId), platform.getProject(projectSlug)).catch((e) => {

                    notificationBar.showNotification(`"${appId}" cannot be opened using magnet link.`, {
                        type: "error"
                    });

                    console.warn(`"${appId}" cannot be opened using magnet link`, e);

                    return Observable.empty();
                });
            }).switchMap((combined: Array<any>) => {
                const [app, project] = combined;
                if (!isPublic) {
                    return Observable.fromPromise(platform.addOpenProjects([project.id], true));
                }
            }, res => res)
                .subscribe((combined: Array<any>) => {

                    this.openingMagnetLinkInProgress = false;

                    const [app, project] = combined;
                    const writable = project.permissions.write;

                    const tab = workbox.getOrCreateAppTab({
                        id: AppHelper.getRevisionlessID(app["sbg:id"]),
                        language: "json",
                        isWritable: isPublic ? true : writable,
                        type: app.class,
                        label: app.label
                    });

                    workbox.openTab(tab);

                }, () => {
                    this.openingMagnetLinkInProgress = false;
                }, () => {
                    this.openingMagnetLinkInProgress = false;
                });

        });

        // Opening local file (double clicking on a file or Open with...)
        ipc.watch("openFileHandler").filter((a) => !!a).flatMap((path) => {
            return ipc.request("getFileOutputInfo", path)
                .catch((e) => {
                    notificationBar.showNotification(`"${path}" cannot be opened.`, {
                        type: "error"
                    });

                    console.warn(`"${path}" cannot be opened using file protocol`, e);

                    return Observable.empty();
                });
        }).subscribe((fsEntry) => {

            const id = fsEntry.path;
            const label = AppHelper.getBasename(fsEntry.path);

            const tab = workbox.getOrCreateAppTab({
                id,
                language: fsEntry.language,
                isWritable: fsEntry.isWritable,
                type: fsEntry.type || "Code",
                label
            });

            workbox.openTab(tab);

        });

    }

}
