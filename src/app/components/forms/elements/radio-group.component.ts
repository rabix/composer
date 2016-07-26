import {Component, Input, ChangeDetectionStrategy} from "@angular/core";
import {BehaviorSubject, Subject} from "rxjs/Rx";
import {RadioButtonComponent} from "./radio-button.component";

interface GroupItem {
    name: string,
    icon: string,
    value: any,
    selected: boolean
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
                         [class.btn-primary]="item.value === (selected | async)"
                         (onClick)="onChildClick($event)"
                         [value]="item.value"
                         [name]="item.name" 
                         [icon]="item.icon">
        </ct-radio-button>        
    `
})
export class RadioGroupComponent {

    public selected: BehaviorSubject<GroupItem>;

    @Input()
    private items: GroupItem[];

    constructor() {
        this.selected = new BehaviorSubject<GroupItem>(null);

    }

    public getSelectedValue() {
        return (this.selected as BehaviorSubject<GroupItem>).getValue();
    }

    ngAfterViewInit() {
        let defaultVal = this.items.find(item => item.selected === true);
        if (defaultVal) {
            (this.selected as Subject<GroupItem>).next(defaultVal.value);
        }
    }

    onChildClick(btn: RadioButtonComponent) {
        (this.selected as Subject<GroupItem>).next(btn.value);
    }
}
