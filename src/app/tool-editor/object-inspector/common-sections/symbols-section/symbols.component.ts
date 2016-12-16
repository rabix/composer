import {Component, forwardRef} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup, FormControl, Validators} from "@angular/forms";
import {ComponentBase} from "../../../../components/common/component-base";
import {GuidService} from "../../../../services/guid.service";

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
                      
               <ol class="list-unstyled">
                    <li *ngFor="let symbol of symbolsFormList; let i = index;" 
                        class="removable-form-control symbol-list-item">
                    
                        <div *ngIf="!!symbolsForm.controls[symbol.id]">
                            <input required class="form-control symbol-input"
                                  type="text"
                                  [ngClass]="{'invalid-input': !symbolsForm.controls[symbol.id].valid }"
                                  [formControl]="symbolsForm.controls[symbol.id]">
        
                            <div class="remove-icon clickable" 
                                *ngIf="symbolsFormList.length > 1"
                                (click)="removeSymbol(symbol)">
                                <i class="fa fa-trash"></i>
                            </div>
                        </div>
                    </li> 
                </ol>
                      
                <button type="button" 
                        class="btn btn-link add-btn-link no-underline-hover" 
                        (click)="addSymbol()">
                    <i class="fa fa-plus"></i>Add Symbol
                </button>
        </form>
        </div>
`
})
export class SymbolsComponent extends ComponentBase implements ControlValueAccessor {

    private symbolsFormList: {id: string, value: string}[] = [];

    private onTouched = () => { };

    private propagateChange = (_) => {};

    private symbolsForm: FormGroup;

    constructor(private guidService: GuidService) {
        super();
    }

    writeValue(symbols: string[]): void {
        this.symbolsForm = new FormGroup({});

        if (symbols.length === 0) {
            this.addSymbol();
        } else {
            this.symbolsFormList = symbols.map((value: string) => {
                return { id: this.guidService.generate(), value };
            });
            this.createFormControls(this.symbolsFormList)
        }

        this.listenToFormChanges();
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    private createFormControls(symbols: {id: string, value: string}[]): void {
        symbols.forEach((ctrl: {id: string, value: string}) => {
            this.symbolsForm.addControl(ctrl.id, new FormControl(ctrl.value));
        });
    }

    private listenToFormChanges(): void {

        this.tracked = this.symbolsForm.valueChanges
            .debounceTime(300)
            .subscribe(change => {

                const symbols: string[] = Object.keys(change)
                    .map(key => change[key].trim())
                    .filter(value => !!value);

                this.propagateChange(symbols);
            });
    }

    private addSymbol(): void {
        const newSymbol = {
            id: this.guidService.generate(),
            value: ""
        };

        this.symbolsForm.addControl(newSymbol.id, new FormControl(newSymbol.value, [Validators.required]));
        this.symbolsFormList.push(newSymbol);
        this.symbolsForm.markAsTouched();
    }

    private removeSymbol(ctrl: {id: string, value: string}): void {
        this.symbolsFormList = this.symbolsFormList.filter(item => item.id !== ctrl.id);
        this.symbolsForm.removeControl(ctrl.id);
        this.symbolsForm.markAsDirty();
    }

    ngOnDestroy(): void {
        this.symbolsFormList.forEach(item => this.symbolsForm.removeControl(item.id));
        super.ngOnDestroy();
    }
}
