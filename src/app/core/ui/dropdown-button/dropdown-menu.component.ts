import {Component, Output, EventEmitter, ChangeDetectionStrategy, Input} from "@angular/core";
import {Observable} from "rxjs";

@Component({
    selector: "ct-dropdown-menu",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ul class="dropdown-menu dropdown-menu-right" aria-haspopup="true" aria-expanded="true" style="display:initial">
            <li class="dropdown-item cursor-pointer" *ngFor="let item of dropDownOptions" (click)="selectItem(item)"
                [class.selected]="item.value === selected?.value">
        
                <div>
                    {{item.caption}}
                </div>
        
                <div class="form-control-label">
                    {{item.description}}
                </div>
        
            </li>
        </ul>
    `
})
export class DropDownMenuComponent {

    @Input()
    public hostElement: HTMLElement;

    @Input()
    public dropDownOptions: { value, caption, description }[] = [];

    @Input()
    public selected: { value, caption, description } = null;

    @Output()
    public select = new EventEmitter();

    private selectItem(item) {
        this.select.emit(item);
    }

    ngOnInit() {
        // Close drop-down menu when you click outside of it
        Observable.fromEvent(document, "click").filter((ev: MouseEvent) => {
            return !this.hostElement.contains(ev.target as Node)
        }).first().subscribe(() => {
            this.selectItem(undefined);
        });
    }
}
