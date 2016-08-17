import {Component, Input, ChangeDetectionStrategy} from "@angular/core";
import {BehaviorSubject, Subject, Observable} from "rxjs/Rx";
import {RadioButtonComponent} from "./radio-button.component";

export interface GroupItem<T> {
    name: string,
    icon?: string,
    value: T,
    selected?: boolean
}

@Component({
    selector: "ct-radio-group",
    directives: [RadioButtonComponent],
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
    public readonly value: Observable<T>;

    @Input()
    private items: GroupItem<T>[];

    constructor() {
        this.value = new BehaviorSubject<T>(undefined);

    }

    public getSelectedValue(): T {
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
