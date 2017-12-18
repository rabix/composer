import {ChangeDetectorRef, Injectable} from "@angular/core";
import * as YAML from "js-yaml";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {FileRepositoryService} from "../../../file-repository/file-repository.service";
import {NotificationBarService} from "../../../layout/notification-bar/notification-bar.service";
import {StatusBarService} from "../../../layout/status-bar/status-bar.service";
import {PlatformRepositoryService} from "../../../repository/platform-repository.service";
import {MenuItem} from "../../../ui/menu/menu-item";
import {TreeNode} from "../../../ui/tree-view/tree-node";
import {AppHelper} from "../../helpers/AppHelper";
import {ErrorWrapper} from "../../helpers/error-wrapper";
import {TabData} from "../../../../../electron/src/storage/types/tab-data-interface";
import {WorkboxService} from "../../workbox/workbox.service";
import {NativeSystemService} from "../../../native/system/native-system.service";

@Injectable()
export class AppsPanelService {

    constructor(protected fileRepository: FileRepositoryService,
                protected platformRepository: PlatformRepositoryService,
                protected notificationBar: NotificationBarService,
                protected workbox: WorkboxService,
                protected statusBar: StatusBarService,
                protected cdr: ChangeDetectorRef,
                protected native: NativeSystemService) {
    }

    makeCopyAppToLocalMenuItem(node: TreeNode<any>): MenuItem {

        return new MenuItem("Copy to Local", {
            click: () => {

                const nodeID = node.label || node.id;
                this.native.createFileChoiceDialog({
                    title: "Choose a File Path",
                    buttonLabel: "Save",
                    defaultPath: `${nodeID}.cwl`,
                    filters: [{name: "Common Workflow Language App", extensions: ["cwl"]}],
                    properties: ["openDirectory"]
                }).then((path) => {

                    if (path) {

                        const savingUpdate  = new Subject();
                        const savingProcess = new Observable(subscriber => {
                            subscriber.next("Fetching " + node.id);

                            savingUpdate.filter(v => v === "loaded").take(1).subscribe(() => subscriber.next("Saving to " + path));
                            savingUpdate.filter(v => v === "saved").take(1).subscribe(() => {
                                subscriber.next(`Saved ${node.id} to ${path}`);
                                subscriber.complete();
                            });
                            savingUpdate.filter(v => v === "failed").take(1).subscribe(() => {
                                subscriber.next("Saving failed");
                                subscriber.complete();
                            });
                        }) as Observable<string>;

                        this.statusBar.enqueue(savingProcess);
                        let appType;

                        this.platformRepository.getApp(node.id, true).then(app => {
                            savingUpdate.next("loaded");
                            appType = app.class;
                            return YAML.dump(app);
                        }).then(text => {
                            return this.fileRepository.saveFile(path, text);
                        }).then(() => {
                            savingUpdate.next("saved");

                            const tab = this.workbox.getOrCreateAppTab({
                                id: path,
                                language: "yaml",
                                isWritable: true,
                                label: AppHelper.getBasename(path),
                                type: appType,
                            } as TabData<any>, true, true);

                            this.workbox.openTab(tab, true, true, true);
                            this.fileRepository.reloadPath(path);

                            this.cdr.markForCheck();
                            this.cdr.detectChanges();

                        }).catch((err) => {
                            savingUpdate.next("failed");
                            this.notificationBar.showNotification("App saving failed. " + new ErrorWrapper(err));

                        });

                    }
                }, () => {});
            }
        });
    }

}
