import {Component, Input, Output, ChangeDetectionStrategy} from "@angular/core";
import {ReplaySubject} from "rxjs";

@Component({
    selector: 'ct-view-mode-switch',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <button (click)="toggleView()" class="btn btn-sm" [disabled]="disabled">
            {{ viewMode }}
            <i class="fa fa-toggle-off" [class.fa-toggle-on]="viewMode === 'gui'"></i>    
        </button>
    `
})
export class ViewModeSwitchComponent {

    @Input()
    public disabled: boolean;

    @Input()
    public viewMode: "gui" | "code" = "code";

    @Output()
    public switch = new ReplaySubject<string>();

    private toggleView() {
        this.switch.next(this.viewMode === "gui" ? "code" : "gui")
    }
}