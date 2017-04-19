import {Component, OnInit, ViewChild, ViewContainerRef} from "@angular/core";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {LayoutService} from "../../core/layout/layout.service";
import {StatusBarService} from "./status-bar.service";

@Component({
    selector: "ct-status-bar",
    styleUrls: ["./status-bar.component.scss"],
    template: `

        <!--Status & panel toggle button-->
        <span class="status-item status-buttons">
            <button class="panel-toggle btn btn-sm" [ngClass]="!layoutService.sidebarExpanded ? 'active' : ''"
                    (click)="layoutService.toggleSidebar()">
                <i class="fa" [ngClass]="layoutService.sidebarExpanded ? 
                    'fa-angle-double-left' : 'fa-angle-double-right'"></i>
            </button>
            <span *ngIf="status">
                {{ status.message }}
                <span *ngIf="status.time">({{ status.time | amTimeAgo }})</span>
            </span>
        </span>

        <!--Process-->
        <span class="status-item">
            <span *ngIf="queueSize">
                {{ statusBar.process | async }}
                <span *ngIf="queueSize > 1">
                    and {{ queueSize - 1 }} more
                </span>
            </span>
        </span>

        <!--Buttons and switches-->
        <span class="status-item status-buttons">
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
        this.tracked = this.statusBar.status.subscribe(s => this.status = s);
        this.tracked = this.statusBar.queueSize.subscribe(s => this.queueSize = s);
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
