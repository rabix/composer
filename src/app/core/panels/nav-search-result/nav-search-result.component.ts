import {ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output} from "@angular/core";

@Component({
    selector: "ct-nav-search-result",
    template: `
        <div class="title">
            <i *ngIf="icon" class="fa fa-fw {{ icon }}"></i>
            {{ title }}
        </div>
        <div class="label"
             [class.ml-2]="icon"
             *ngIf="label">{{ label }}</div>
    `,
    styleUrls: ["./nav-search-result.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavSearchResultComponent implements OnInit {

    @Input()
    title: string;

    @Input()
    icon: string;

    @Input()
    label: string;

    @Output()
    open = new EventEmitter<any>();

    @HostListener("dblclick")
    triggerOpen() {
        this.open.emit();
    }

    constructor() {
    }

    ngOnInit() {
    }

}
