import {Component, Input, ElementRef, forwardRef, Output, EventEmitter, ChangeDetectionStrategy} from "@angular/core";
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from "@angular/forms";

@Component({
    selector: "ct-dropdown-button",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DropDownButtonComponent), multi: true}
    ],
    template: `

        <div class="btn-group dropdown" [class.open]="toggle" (document:click)="clickOnDocument($event)">

            <button class="btn btn-secondary dropdown-toggle" (click)="toggleMenu()" type="button">
                {{selected?.caption}}
            </button>

            <ul class="dropdown-menu dropdown-menu-right" aria-haspopup="true" aria-expanded="true">
                <li href class="dropdown-item" *ngFor="let item of dropDownOptions" (click)="select(item)"
                    [class.selected]="item.value === selected?.value">
                    <div>
                        {{item.caption}}
                    </div>

                    <div class="form-control-label">
                        {{item.description}}
                    </div>
                </li>
            </ul>
        </div>

    `
})
export class DropDownButtonComponent implements ControlValueAccessor {

    @Input()
    public dropDownOptions: { value, caption, description }[] = [];

    private selected: { value, caption, description } = null;

    @Input('value') set value(value: string) {
        this.externalSelect(value);
    }

    @Output()
    public change = new EventEmitter();

    private toggle = false;

    private el: Element;

    constructor(el: ElementRef) {
        this.el = el.nativeElement;
    }

    writeValue(value: string): void {
        this.externalSelect(value);
    }

    /**
     * Selects option in drop down list when value is changed externally using [value], [ngModel], [formControl] bindings
     */
    private externalSelect(value: string) {
        this.selected = this.dropDownOptions.find(item => item.value === value) || this.dropDownOptions[0];
    }

    /**
     * Open/close drop down menu
     */
    private toggleMenu() {
        this.toggle = !this.toggle;
    }

    private select(item) {
        // Avoid selecting if its already selected
        if (this.selected && this.selected !== item) {
            this.selected = item;
            this.change.emit(this.selected.value);
            this.propagateChange(this.selected.value);
        }

        // Close drop down menu
        this.toggle = false;
    }

    /**
     * If clicked outside of an element, close drop down menu
     */
    clickOnDocument(ev) {
        if (!(!!this.el && this.el.contains(ev.target))) {
            this.toggle = false;
        }
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    private onTouched = () => {
    };

    private propagateChange = (_) => {
    };
}
