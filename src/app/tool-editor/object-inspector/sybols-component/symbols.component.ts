import {Component, forwardRef} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl} from "@angular/forms";
import {ComponentBase} from "../../../components/common/component-base";
import {GuidService} from "../../../services/guid.service";

require("./symbols.component.scss");

@Component({
    selector: 'symbols-section',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SymbolsComponent), multi: true }
    ],
    template: `
        <div class="form-group" *ngIf="symbolsForm">
        <form>
               <label>Symbols</label>
               <compact-list *ngIf="symbolsForm" 
                            [addKeyCode]="13"
                            [formControl]="symbolsForm">
                </compact-list>
                     
        </form>
        </div>
`
})
export class SymbolsComponent extends ComponentBase implements ControlValueAccessor {

    private onTouched = () => { };

    private propagateChange = (_) => {};

    private symbolsForm: FormControl;

    constructor(private guidService: GuidService) {
        super();
    }

    private writeValue(symbols: string[]): void {
        this.symbolsForm = new FormControl(symbols || []);
        this.listenToFormChanges();
    }

    private registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    private registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    private listenToFormChanges(): void {

        this.tracked = this.symbolsForm.valueChanges
            .debounceTime(300)
            .subscribe(symbols => this.propagateChange(symbols));
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
