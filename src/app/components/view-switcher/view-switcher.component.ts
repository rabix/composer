import {Component, Input, Output, ChangeDetectionStrategy} from "@angular/core";
import {ReplaySubject} from "rxjs";

export enum ViewMode {
    Code,
    Gui,
    Diff
}

@Component({
    selector: 'ct-view-mode-switch',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <button (click)="toggleView()" class="btn btn-sm" [disabled]="disabled">
            <span *ngIf="viewMode === __viewModes.Code">Code</span>
            <span *ngIf="viewMode === __viewModes.Gui">GUI</span>
            <i class="fa fa-toggle-off" [class.fa-toggle-on]="viewMode === __viewModes.Gui"></i>    
        </button>
    `
})
export class ViewModeSwitchComponent {

    @Input()
    public disabled: boolean;

    @Input()
    public viewMode = ViewMode.Code;

    @Output()
    public switch = new ReplaySubject<ViewMode>();

    /** Needed in order to use the ViewMode enum in the template */
    private __viewModes = ViewMode;

    /**
     * Switch back and forth between view modes
     */
    private toggleView() {
        this.switch.next(this.viewMode === ViewMode.Gui ? ViewMode.Code : ViewMode.Gui);
    }
}