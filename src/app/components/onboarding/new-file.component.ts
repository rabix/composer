import {Component, OnInit, ViewEncapsulation} from "@angular/core";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {UserPreferencesService} from "../../services/storage/user-preferences.service";
import {WorkboxService} from "../../core/workbox/workbox.service";
import {ModalService} from "../../ui/modal/modal.service";
import {CreateAppModalComponent} from "../../core/modals/create-app-modal/create-app-modal.component";

@Component({
    encapsulation: ViewEncapsulation.None,
    styleUrls: ["new-file.component.scss"],
    selector: "ct-new-file-tab",
    template: `
        <ct-action-bar></ct-action-bar>
        <div class="content-container">

            <!--Top empty space-->
            <div class="top-empty-space"></div>

            <!--Apps container-->
            <div class="apps-container">

                <!--New app container-->
                <div class="apps">

                    <!--Container title-->
                    <div class="title">
                        <h5>
                            <p><b>CREATE NEW APP</b></p>
                        </h5>
                    </div>

                    <!--Container context-->
                    <div class="app-container">

                        <!--Workflow-->
                        <div class="app clickable" (click)="openAppCreation('workflow')">

                            <!--Image-->
                            <div class="image-container">
                                <div class="image workflow"></div>
                            </div>

                            <!--Description-->
                            <div class="description">
                                <h5>
                                    <b>Workflow</b>
                                </h5>
                                <p>
                                    Workflows are chains of interconnected tools.
                                </p>
                            </div>
                        </div>

                        <!--Tool-->
                        <div class="app clickable" (click)="openAppCreation('tool')">

                            <!--Image-->
                            <div class="image-container">
                                <div class="image tool"></div>
                            </div>

                            <!--Description-->
                            <div class="description">
                                <h5>
                                    <b>Tool</b>
                                </h5>
                                <p>
                                    Tools are programs for processing data.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!--Recent apps container-->
                <div class="apps">

                    <!--Container title-->
                    <div class="title">
                        <h5>
                            <p><b>RECENT APPS</b></p>
                        </h5>
                    </div>

                    <!--Container context-->
                    <div class="app-container">
                        <div class="app">
                            <div class="revisions">
                                <ct-nav-search-result *ngFor="let entry of recentApps"
                                                      class="pl-1 pr-1 deep-unselectable"
                                                      [id]="entry?.id"
                                                      [icon]="entry.type === 'Workflow' ? 'fa-share-alt': 'fa-terminal'"
                                                      [title]="entry?.title"
                                                      [label]="entry?.label"
                                                      (dblclick)="openRecentApp(entry)">
                                </ct-nav-search-result>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <!--Bottom empty space-->
            <div class="bottom-empty-space"></div>

        </div>

        <ct-getting-started></ct-getting-started>
    `
})
export class NewFileTabComponent extends DirectiveBase implements OnInit {

    public recentApps = [];

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

    openRecentApp(entry: { id: string }) {
        this.workbox.getOrCreateFileTab(entry.id).take(1).subscribe(tab => this.workbox.openTab(tab));
    }

    openAppCreation(type: "workflow" | "tool") {
        const modal = this.modal.fromComponent(CreateAppModalComponent, {
            closeOnOutsideClick: false,
            backdrop: true,
            title: `Create a New App`,
            closeOnEscape: true
        });

        modal.appType = type;
    }
}

