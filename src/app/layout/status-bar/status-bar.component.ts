import {Component, OnInit, ViewChild, ViewContainerRef} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {LayoutService} from "../../core/layout/layout.service";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {StatusBarService} from "./status-bar.service";

@Component({
    selector: "ct-status-bar",
    styleUrls: ["./status-bar.component.scss"],
    template: `

        <span class="status-item pull-left">
            
            <!--Sidebar toggle button-->
            <span class="btn-group status-buttons sidebar-toggle-btn-group" >
                <button class="sidebar-toggle btn btn-sm" data-test="sidebar-toggle-button"
                        [class.active]="layoutService.sidebarHidden"
                        (click)="layoutService.toggleSidebar()">
                    <i class="fa"
                       [class.fa-angle-double-left]="!layoutService.sidebarHidden"
                       [class.fa-angle-double-right]="layoutService.sidebarHidden"></i>
                </button>
            </span>
            
            <span class="status-element">
                <span *ngIf="queueSize > 0; else statusMsg" [ct-tooltip]="statusBar.process | async">
                    <span class="loader"></span>
                    {{ statusBar.process | async }}
                    <span *ngIf="queueSize > 1">
                        and {{ queueSize - 1 }} more
                    </span>
                </span>
                
                <ng-template #statusMsg>
                    {{ status?.message }}
                    <span *ngIf="status?.time">({{ status?.time | amTimeAgo }})</span>
                </ng-template>
            </span>
            
        </span>

        <!--Buttons and switches-->
        <span class="status-item pull-right status-buttons">
            <span #controlHost></span>
        </span>
    `
})
export class StatusBarComponent extends DirectiveBase implements OnInit {

    status: { message: string, time?: Date };

    queueSize = 0;

    @ViewChild("controlHost", {read: ViewContainerRef})
    private controlHost: ViewContainerRef;

    constructor(public statusBar: StatusBarService,
                public layoutService: LayoutService) {
        super();

        this.statusBar.status.subscribeTracked(this, s => this.status = s);
        this.statusBar.queueSize.subscribeTracked(this, s => this.queueSize = s);
    }

    ngOnInit() {

        this.statusBar.controls.subscribe(tpl => {
            this.controlHost.clear();

            if (tpl) {
                this.controlHost.createEmbeddedView(tpl);
            }
        });
    }
}
