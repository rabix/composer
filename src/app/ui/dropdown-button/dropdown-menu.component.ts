import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation} from "@angular/core";
import {fromEvent} from "rxjs/observable/fromEvent";
import {first, filter} from "rxjs/operators";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-dropdown-menu",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ul class="dropdown-menu dropdown-menu-right" aria-haspopup="true" aria-expanded="true" style="display:initial">
            <li class="dropdown-item clickable" *ngFor="let item of dropDownOptions" (click)="selectItem(item)"
                [class.active]="item.value === selected?.value">

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
    hostElement: HTMLElement;

    @Input()
    dropDownOptions: { value, caption, description }[] = [];

    @Input()
    selected: { value, caption, description } = null;

    @Output()
    select = new EventEmitter();

    private selectItem(item) {
        this.select.emit(item);
    }

    ngOnInit() {
        // Close drop-down menu when you click outside of it
        fromEvent(document, "click").pipe(
            filter((ev: MouseEvent) => !this.hostElement.contains(ev.target as Node)),
            first()
        ).subscribe(() => this.selectItem(undefined));
    }
}
