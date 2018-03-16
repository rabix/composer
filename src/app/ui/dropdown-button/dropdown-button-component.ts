import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    Output,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {DropDownMenuComponent} from "./dropdown-menu.component";
import {first} from "rxjs/operators";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-dropdown-button",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DropDownButtonComponent), multi: true}
    ],
    template: `
        <div class="btn-group dropdown" [class.open]="toggle" (click)="showMenu(!toggle)">

            <button #button
                    class="btn btn-secondary dropdown-toggle"
                    type="button"
                    [disabled]="readonly">
                {{selected?.caption}}
            </button>

        </div>
    `
})
export class DropDownButtonComponent extends DirectiveBase implements ControlValueAccessor {

    @Input()
    readonly = false;

    @Input()
    dropDownOptions: { value, caption, description }[] = [];

    @Input("value") set value(value: string) {
        this.externalSelect(value);
    }

    @Output()
    change = new EventEmitter();

    @ViewChild("button", {read: ViewContainerRef}) button;
                                                   toggle = false;

    selected: { value, caption, description } = null;

    private onTouched       = () => void 0;
    private propagateChange = (val?: any) => void 0;
    private el: HTMLElement;
    private dropDownList: ComponentRef<DropDownMenuComponent>;

    constructor(el: ElementRef, private resolver: ComponentFactoryResolver, private cdr: ChangeDetectorRef) {
        super();
        this.el = el.nativeElement;
    }


    writeValue(value: string): void {
        this.externalSelect(value);
    }

    /**
     * Show/Hide drop-down menu
     */
    showMenu(show: boolean) {
        this.toggle = show;
        show ? this.createDropDownMenu() : this.destroyDropDownMenu();
    }

    /**
     * Dynamically creates drop-down menu
     */
    createDropDownMenu() {
        const factory     = this.resolver.resolveComponentFactory(DropDownMenuComponent);
        this.dropDownList = this.button.createComponent(factory);
        const instance    = this.dropDownList.instance;

        instance.dropDownOptions = this.dropDownOptions;
        instance.hostElement     = this.el;
        instance.selected        = this.selected;
        instance["select"].pipe(
            first()
        ).subscribe((item) => {
            this.select(item);
        });
    }

    /**
     * Destroys dynamically created drop-down menu
     */
    destroyDropDownMenu() {
        this.dropDownList && this.dropDownList.destroy();
        this.dropDownList = null;

        // Needed when hide is coming from drop-down menu (change detection is not triggered)
        this.cdr.markForCheck();
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    /**
     * Selects option in drop down list when value is changed externally using [value], [ngModel], [formControl] bindings
     */
    private externalSelect(value: string) {
        this.selected = this.dropDownOptions.find(item => item.value === value) || this.dropDownOptions[0];
    }

    /**
     * Selects item
     */
    private select(item) {
        // Avoid selecting if its already selected
        if (this.selected && item && this.selected !== item) {
            this.selected = item;
            this.change.emit(this.selected.value);
            this.propagateChange(this.selected.value);
        }

        // Close drop-down menu
        this.showMenu(false);
    }

}
