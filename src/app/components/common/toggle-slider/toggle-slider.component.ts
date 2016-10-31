import {Component, Input, Output, EventEmitter} from "@angular/core";

require("./toggle-slider.component.scss");

@Component({
    selector: "toggle-slider",
    template: `
        <button class="toggle-button" (click)="toggleCheck()">
            <i class="fa fa-toggle-off fa-lg" [class.fa-toggle-on]="checked"></i>    
        </button>
    `
})
export class ToggleComponent {

    @Input()
    public checked: boolean;

    @Output()
    public checkedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    private toggleCheck(): void {
        this.checked = !this.checked;
        this.checkedChange.emit(this.checked);
    }
}
