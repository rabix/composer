import {Component, OnInit, ViewChild, ViewContainerRef} from "@angular/core";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {StatusBarService} from "./status-bar.service";

@Component({
    selector: "ct-status-bar",
    styleUrls: ["./status-bar.component.scss"],
    template: `

        <!--Status-->
        <span class="status-item">
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
        <span class="status-item">
            <span #controlHost></span>
        </span>
    `
})
export class StatusBarComponent extends DirectiveBase implements OnInit {

    status: { message: string, time?: Date };

    queueSize = 0;

    @ViewChild("controlHost", {read: ViewContainerRef})
    private controlHost: ViewContainerRef;

    constructor(public statusBar: StatusBarService) {
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
