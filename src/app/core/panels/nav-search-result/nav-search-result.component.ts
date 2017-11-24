import {Component, EventEmitter, HostListener, Input, Output} from "@angular/core";
import {TabData} from "../../../../../electron/src/storage/types/tab-data-interface";

@Component({
    selector: "ct-nav-search-result",
    template: `
        <div class="title">
            <i *ngIf="icon" class="fa fa-fw {{ icon }}"></i>
            {{ title }}
        </div>
        <div class="label"
             [class.ml-2]="icon"
             *ngIf="label">{{ label }}
        </div>
    `,
    styleUrls: ["./nav-search-result.component.scss"],
})
export class NavSearchResultComponent {

    @Input() id: string;
    @Input() title: string;
    @Input() icon: string;
    @Input() label: string;

    @Input() dragEnabled      = false;
    @Input() dragLabel        = "";
    @Input() dragImageClass   = "";
    @Input() dragTransferData = {};
    @Input() dragDropZones    = ["graph-editor"];

    @Input() tabData?: TabData<any>;

    @Output()
    open = new EventEmitter<any>();

    @HostListener("dblclick")
    triggerOpen() {
        this.open.emit(this);
    }
}
