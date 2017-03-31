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
                            <div class="image-container p-2">
                                <div class="image workflow">
                                    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 311.5 296" style="enable-background:new 0 0 311.5 296;" xml:space="preserve">
<style type="text/css">
	.st0 {
        fill: #333333;
    }
</style>
<title>workflow</title>
<g id="Layer_5_copy">
	<g id="Layer_2_copy_3">
		<circle class="st0" cx="59" cy="59" r="41"/>
	</g>
	<g id="Layer_2_copy_3-2">
		<path class="st0" d="M59,118C26.4,118,0,91.6,0,59S26.4,0,59,0s59,26.4,59,59l0,0C118,91.6,91.6,118,59,118z M59,6
			C29.7,6,6,29.7,6,59s23.7,53,53,53c29.3,0,53-23.7,53-53C112,29.7,88.3,6,59,6z"/>
	</g>
	<g id="Layer_2_copy_3-3">
		<circle class="st0" cx="115.5" cy="59.5" r="10"/>
	</g>
</g>
<g id="Layer_5">
	<g id="Layer_2_copy">
		<circle class="st0" cx="59" cy="237" r="41"/>
	</g>
	<g id="Layer_2">
		<path class="st0" d="M59,296c-32.6,0-59-26.4-59-59s26.4-59,59-59s59,26.4,59,59l0,0C118,269.6,91.6,296,59,296z M59,184
			c-29.3,0-53,23.7-53,53s23.7,53,53,53c29.3,0,53-23.7,53-53l0,0C112,207.7,88.3,184,59,184z"/>
	</g>
	<g id="Layer_2_copy_2">
		<circle class="st0" cx="115.5" cy="237.5" r="10"/>
	</g>
</g>
<g id="Layer_5_copy_2">
	<g id="Layer_2_copy_4">
		<circle class="st0" cx="245" cy="148" r="41"/>
	</g>
	<g id="Layer_2_copy_4-2">
		<path class="st0" d="M245,207c-32.6,0-59-26.4-59-59s26.4-59,59-59s59,26.4,59,59l0,0C304,180.6,277.6,207,245,207z M245,95
			c-29.3,0-53,23.7-53,53s23.7,53,53,53s53-23.7,53-53C298,118.7,274.3,95,245,95z"/>
	</g>
	<g id="Layer_2_copy_4-3">
		<circle class="st0" cx="301.5" cy="148.5" r="10"/>
		<circle class="st0" cx="191.5" cy="128.5" r="10"/>
		<circle class="st0" cx="191.5" cy="168.5" r="10"/>
	</g>
</g>
<g id="Layer_15">
	<path class="st0" d="M191.5,131.5c-16,0-23.9-15.2-32.3-31.2c-10-19-20.3-38.8-44.7-38.8v-6c28,0,39.7,22.3,50,42
		c7.9,15,14.7,28,27,28V131.5z"/>
	<path class="st0" d="M114.5,241.5v-6c12.3,0,19.1-13,27-28c10.3-19.7,22-42,50-42v6c-24.4,0-34.7,19.7-44.7,38.8
		C138.4,226.3,130.5,241.5,114.5,241.5z"/>
</g>
</svg>


                                </div>
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
                            <div class="image-container p-2">
                                <div class="image tool">
                                    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 318.8 296" style="enable-background:new 0 0 318.8 296;" xml:space="preserve">
<style type="text/css">
	.st0 {
        fill: #333333;
    }
</style>
<title>Asset 1</title>
<g id="Layer_2">
	<g id="Layer_20">
		<polygon class="st0" points="13.6,296 0,281.3 143.1,148 0,14.7 13.6,0 172.5,148 		"/>
	</g>
	<g id="Layer_19">
		<rect x="188.8" y="276" class="st0" width="130" height="20"/>
	</g>
</g>
</svg>


                                </div>
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

