import {Component} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {RecentAppTab} from "../../../../../electron/src/storage/types/recent-app-tab";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {CreateAppModalComponent} from "../../modals/create-app-modal/create-app-modal.component";
import {WorkboxService} from "../../workbox/workbox.service";
import {NewFileTabService} from "./new-file-tab.service";

@Component({
    styleUrls: ["new-file-tab.component.scss"],
    selector: "ct-new-file-tab",
    providers: [NewFileTabService],
    template: `
        <ct-action-bar></ct-action-bar>

        <div class="content-container p-2 mb-2">

            <!--Apps container-->
            <div class="apps-container">

                <!--New app container-->
                <div class="apps mr-1">

                    <!--Container title-->

                    <div class="text-title">Actions</div>

                    <div class="creation-entry p-1 mt-1 clickable deep-unselectable"
                         data-test="create-workflow-button"
                         (click)="openAppCreation('Workflow')">

                        <i class="fa fa-fw fa-share-alt fa-3x float-sm-left pl-1"></i>
                        <div class="content float-sm-left">
                            <div class="title text-title">New Workflow</div>
                            <div class="description">Workflows are chains of interconnected tools.</div>
                        </div>
                    </div>

                    <div class="creation-entry p-1 mt-1 clickable deep-unselectable" data-test="create-tool-button"
                         (click)="openAppCreation('CommandLineTool')">
                        <i class="fa fa-fw fa-terminal fa-3x float-sm-left pr-1"></i>
                        <div class="content float-sm-left">
                            <div class="title text-title">New Command Line Tool</div>
                            <div class="description">Tools are programs for processing data.</div>
                        </div>
                    </div>
                </div>

                <!--Recent apps container-->
                <div class="apps">
                    <!--Container title-->
                    <div class="text-title mb-1">Recently Opened</div>

                    <!--Container context-->
                    <div class="app-container">
                        <div class="app p-1">
                            <div class="revisions">
                                <ct-nav-search-result *ngFor="let entry of service.getRecentApps() | async"
                                                      data-test="recent-apps-list"
                                                      class="pl-1 pr-1 deep-unselectable"
                                                      [id]="entry?.id"
                                                      [icon]="entry.type === 'Workflow' ? 'fa-share-alt': 'fa-terminal'"
                                                      [title]="entry?.label"
                                                      [label]="entry?.description"
                                                      (dblclick)="openRecentApp(entry)">
                                </ct-nav-search-result>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>

        <ct-getting-started></ct-getting-started>
    `
})
export class NewFileTabComponent extends DirectiveBase {

    recentApps: Observable<RecentAppTab[]>;

    constructor(public service: NewFileTabService,
                private modal: ModalService,
                private workbox: WorkboxService) {
        super();
    }

    openRecentApp(appData: RecentAppTab) {
        const tab = this.workbox.getOrCreateAppTab(appData);
        this.workbox.openTab(tab);
    }

    openAppCreation(type: "Workflow" | "CommandLineTool") {
        this.modal.fromComponent(CreateAppModalComponent, `Create a new ${type}`, {
            appType: type
        });
    }
}

