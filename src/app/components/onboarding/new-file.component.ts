import {Component, OnInit} from "@angular/core";
import {CreateAppModalComponent} from "../../core/modals/create-app-modal/create-app-modal.component";
import {WorkboxService} from "../../core/workbox/workbox.service";
import {UserPreferencesService} from "../../services/storage/user-preferences.service";
import {ModalService} from "../../ui/modal/modal.service";
import {DirectiveBase} from "../../util/directive-base/directive-base";

@Component({
    styleUrls: ["new-file.component.scss"],
    selector: "ct-new-file-tab",
    template: `
        <ct-action-bar></ct-action-bar>

        <div class="content-container p-2 mb-2">

            <!--Apps container-->
            <div class="apps-container">

                <!--New app container-->
                <div class="apps mr-1">

                    <!--Container title-->

                    <div class="text-title">Actions</div>

                    <div class="creation-entry p-1 mt-1 clickable deep-unselectable" data-test="create-workflow-btn"
                         (click)="openAppCreation('workflow')">
                        <i class="fa fa-fw fa-share-alt fa-4x float-sm-left "></i>
                        <div class="content float-sm-left">
                            <div class="title text-title">Create a Workflow</div>
                            <div class="description">Workflows are chains of interconnected tools.</div>
                        </div>
                    </div>

                    <div class="creation-entry p-1 mt-1 clickable deep-unselectable" data-test="create-tool-btn"
                         (click)="openAppCreation('tool')">
                        <i class="fa fa-fw fa-terminal fa-4x float-sm-left"></i>
                        <div class="content float-sm-left">
                            <div class="title text-title">Create a Command Line Tool</div>
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
                                <ct-nav-search-result *ngFor="let entry of recentApps"
                                                      class="pl-1 pr-1 deep-unselectable"
                                                      [id]="entry?.id"
                                                      [icon]="entry.type === 'Workflow' ? 'fa-share-alt': 'fa-terminal'"
                                                      [title]="entry?.title"
                                                      [label]="entry?.label"
                                                      (dblclick)="openRecentApp(entry?.id)">
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
export class NewFileTabComponent extends DirectiveBase implements OnInit {

    recentApps = [];

    constructor(private preferences: UserPreferencesService,
                private modal: ModalService,
                private workbox: WorkboxService) {
        super();
    }

    ngOnInit(): void {
        this.tracked = this.preferences.get("recentApps", []).subscribe((items) => {
            this.recentApps = items.slice().reverse();
        });
    }

    openRecentApp(id: string) {
        this.workbox.getOrCreateFileTabAndOpenIt(id);
    }

    openAppCreation(type: "workflow" | "tool") {
        const modal = this.modal.fromComponent(CreateAppModalComponent, {
            closeOnOutsideClick: false,
            backdrop: true,
            title: `Create a new ${type === "workflow" ? "Workflow" : "Command Line Tool"}`,
            closeOnEscape: true
        });

        modal.appType = type;
    }
}

