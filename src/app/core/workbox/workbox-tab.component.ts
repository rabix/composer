import {
    AfterViewInit,
    ChangeDetectorRef, Component, Input, OnChanges, ViewChild,
} from "@angular/core";

import {WorkboxTab} from "./workbox-tab.interface";

@Component({
    selector: "ct-workbox-tab",
    styleUrls: ["./workbox-tab.component.scss"],
    template: `
        <ng-container [ngSwitch]="tab?.type">

            <ct-tool-editor #tabComponent class="tab-component" *ngSwitchCase="'CommandLineTool'"
                            [data]="tab.data"></ct-tool-editor>

            <ct-workflow-editor #tabComponent class="tab-component"[data]="tab.data" *ngSwitchCase="'Workflow'">
            </ct-workflow-editor>

            <ct-file-editor #tabComponent class="tab-component" [data]="tab.data"
                            *ngSwitchCase="'Code'"></ct-file-editor>

            <ct-welcome-tab #tabComponent class="tab-component" *ngSwitchCase="'Welcome'"></ct-welcome-tab>

            <ct-new-file-tab #tabComponent class="tab-component" *ngSwitchCase="'NewFile'"></ct-new-file-tab>

            <ct-settings #tabComponent class="tab-component" *ngSwitchCase="'Settings'"></ct-settings>

            <ct-tab-loader #tabComponent class="tab-component" *ngSwitchDefault></ct-tab-loader>
            
        </ng-container>
    `
})
export class WorkBoxTabComponent implements OnChanges, WorkboxTab, AfterViewInit {

    @Input()
    isActive;

    @Input()
    tab;

    private isTabViewInitialized = false;

    @ViewChild("tabComponent")
    private tabComponent: any;

    constructor(private cdr: ChangeDetectorRef) {
    }

    ngOnChanges() {

        if (this.isTabViewInitialized) {
            // If tab is not active detach its change detector from the main change detector (significant performance boost)
            if (this.isActive) {
                this.cdr.reattach();
                this.cdr.markForCheck();
            } else {
                this.cdr.detach();
            }
        }

    }

    provideStatusControls() {
        if (this.tabComponent.provideStatusControls) {
            return this.tabComponent.provideStatusControls();
        }
    }

    onTabActivation () {
        if (this.tabComponent.onTabActivation) {
            return this.tabComponent.onTabActivation();
        }
    }

    registerOnTabLabelChange(update: (label: string) => void, originalLabel: string) {
        if (this.tabComponent.registerOnTabLabelChange) {
            this.tabComponent.registerOnTabLabelChange(update, originalLabel);
        }
    }

    ngAfterViewInit(): void {
        this.isTabViewInitialized = true;

        // If tab is changed (not active) in the meanwhile, detach its cdr from main cdr
        if (!this.isActive) {
            this.cdr.detach();
        }
    }
}
