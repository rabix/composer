import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Project} from "../../../../electron/src/sbg-api-client/interfaces";
import {RawApp} from "../../../../electron/src/sbg-api-client/interfaces/raw-app";
import {AuthService} from "../../auth/auth.service";
import {AuthCredentials} from "../../auth/model/auth-credentials";
import {NotificationBarService} from "../../layout/notification-bar/notification-bar.service";
import {PlatformRepositoryService} from "../../repository/platform-repository.service";
import {IpcService} from "../../services/ipc.service";
import {ModalService} from "../../ui/modal/modal.service";
import {GlobalService} from "../global/global.service";
import {AppHelper} from "../helpers/AppHelper";
import {PlatformCredentialsModalComponent} from "../modals/platform-credentials-modal/platform-credentials-modal.component";
import {WorkboxService} from "../workbox/workbox.service";

@Injectable()
export class OpenExternalFileService {

    private openingMagnetLinkInProgress = false;

    constructor(private ipc: IpcService,
                private auth: AuthService,
                private global: GlobalService,
                private workbox: WorkboxService,
                private modalService: ModalService,
                private platform: PlatformRepositoryService,
                private notificationBar: NotificationBarService) {
    }

    watchDeepLinks() {


        const deepLinks = this.ipc.watch("deepLinkingHandler").filter(data => !!data);

        deepLinks.subscribe(data => {


            const linkHasValidData = data.username && data.appId && data.url;

            if (this.openingMagnetLinkInProgress || !linkHasValidData) {
                return;
            }

            this.openingMagnetLinkInProgress = true;

            const {username, appId, url, isPublic = false} = data;

            const projectSlug = appId.split("/").splice(0, 2).join("/");

            const currentCredentials = this.auth.getCredentials().take(1);

            const userActivated = this.auth.getActive().filter(u => u && u.user.username === username && u.url === url).take(1);

            currentCredentials
            // Try to find an existing user with these credentials
                .map(cred => cred.find(c => c.user.username === username && c.url === url))

                // Based on whether we found the user, activate that user, or prompt for credentials for adding a new one
                .switchMap(user => user ? this.updateActiveUser(user) : this.promptCredentials(username, url))

                // Wait until we get the signal that the new user is activated
                .switchMap(() => userActivated)

                // Wait for app and project fetching to complete, or show an error notification if it breaks
                .switchMap(() => this.fetchProjectAndApp(appId, projectSlug))

                .switchMap(combined => {
                    const [app, project] = combined;

                    if (isPublic) {
                        return Observable.empty();
                    }

                    return Observable.fromPromise(this.platform.addOpenProjects([project.id], true));

                }, inner => inner)
                .finally(() => this.openingMagnetLinkInProgress = false)

                .subscribe((combined: Array<any>) => {

                    const [app, project] = combined;
                    const writable       = project.permissions.write;

                    const tab = this.workbox.getOrCreateAppTab({
                        id: AppHelper.getRevisionlessID(app["sbg:id"]),
                        language: "json",
                        isWritable: isPublic ? true : writable,
                        type: app.class,
                        label: app.label
                    });

                    this.workbox.openTab(tab);

                }, () => void 0);

        });

        // Opening local file (double clicking on a file or Open with...)
        this.ipc.watch("openFileHandler").filter((a) => !!a).flatMap((path) => {
            return this.ipc.request("getFileOutputInfo", path)
                .catch((e) => {
                    this.notificationBar.showNotification(`"${path}" cannot be opened.`, {
                        type: "error"
                    });

                    console.warn(`"${path}" cannot be opened using file protocol`, e);

                    return Observable.empty();
                });
        }).subscribe((fsEntry) => {

            const id    = fsEntry.path;
            const label = AppHelper.getBasename(fsEntry.path);

            const tab = this.workbox.getOrCreateAppTab({
                id,
                language: fsEntry.language,
                isWritable: fsEntry.isWritable,
                type: fsEntry.type || "Code",
                label
            });

            this.workbox.openTab(tab);

        });
    }

    private fetchProjectAndApp(appId: any, projectSlug: string): Observable<[RawApp, Project]> {
        return Observable.combineLatest(
            this.platform.getApp(appId),
            this.platform.getProject(projectSlug)
        ).take(1).catch(e => {

            this.notificationBar.showNotification(`"${appId}" cannot be opened using magnet link.`, {
                type: "error"
            });

            console.warn(`"${appId}" cannot be opened using magnet link`, e);

            return Observable.empty();
        }) as Observable<[RawApp, Project]>;
    }

    private promptCredentials(username: string, url: string) {

        return Observable.fromPromise(this.modalService.wrapPromise((resolve) => {
            const modal = this.modalService.fromComponent(PlatformCredentialsModalComponent, "Add an Account");

            modal.user              = {username: username};
            modal.platform          = url;
            modal.tokenOnly         = true;
            modal.forceActivateUser = true;

            modal.submit.take(1).subscribe(() => {
                resolve();
                this.modalService.close();
            });

        }));
    }

    private updateActiveUser(existingMatchedUser: AuthCredentials): Observable<any> {

        const userUpdate = this.auth.setActiveCredentials(existingMatchedUser).then(data => {
            this.global.reloadPlatformData();
            this.workbox.forceReloadTabs();
            return data;
        });

        // If there is a user, set user to be the active one
        return Observable.fromPromise(userUpdate);
    }
}
