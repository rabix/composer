import {Component, ViewChild, ViewContainerRef, ViewEncapsulation} from "@angular/core";
import {StatusBarService} from "./status-bar.service";
import {ComponentBase} from "../../components/common/component-base";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-status-bar",
    styleUrls: ["./status-bar.component.scss"],
    template: `

        <!--Status-->
        <span class="status-item hidden-md-down">
            <span *ngIf="status">
                {{ status.message }}
                <span *ngIf="status.time">({{ status.time | amTimeAgo }})</span>
            </span>
        </span>

        <!--Process-->
        <span class="status-item">
            <span *ngIf="queueSize">
                {{ service.process | async }}
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
export class StatusBarComponent extends ComponentBase {

    public status: { message: string, time?: Date };

    private queueSize = 0;

    @ViewChild("controlHost", {read: ViewContainerRef})
    private controlHost: ViewContainerRef;

    constructor(private service: StatusBarService) {
        super();
        this.tracked = this.service.status.subscribe(s => this.status = s);
        this.tracked = this.service.queueSize.subscribe(s => this.queueSize = s);
    }

    ngOnInit() {

        this.service.controls.subscribe(tpl => {
            this.controlHost.clear();

            if (tpl) {
                this.controlHost.createEmbeddedView(tpl);
            }
        });
    }
}
