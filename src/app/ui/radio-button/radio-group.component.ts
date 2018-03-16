import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {RadioButtonComponent} from "./radio-button.component";

export interface GroupItem<T> {
    name: string,
    icon?: string,
    value: T,
    selected?: boolean
}

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-radio-group",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: "form-group"
    },
    template: `
        <ct-radio-button #btn *ngFor="let item of items"
                         [class.btn-primary]="item.value === (value | async)"
                         (onClick)="onChildClick($event)"
                         [value]="item.value"
                         [name]="item.name"
                         [icon]="item.icon">
        </ct-radio-button>
    `
})
export class RadioGroupComponent<T> {

    /** Observable of an actively selected value */
    readonly value: Observable<T>;

    @Input()
    items: GroupItem<T>[];

    constructor() {
        this.value = new BehaviorSubject<T>(undefined);

    }

    getSelectedValue(): T {
        return (this.value as BehaviorSubject<T>).getValue();
    }

    ngAfterViewInit() {
        const defaultItem = this.items.find(item => item.selected === true);

        if (defaultItem) {
            (this.value as Subject<T>).next(defaultItem.value);
        }
    }

    onChildClick(btn: RadioButtonComponent<T>) {
        (this.value as Subject<T>).next(btn.value);
    }
}
