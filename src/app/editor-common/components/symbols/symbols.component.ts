import {Component, forwardRef, Input, ViewEncapsulation} from "@angular/core";
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from "@angular/forms";
import {noop} from "../../../lib/utils.lib";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {debounceTime} from "rxjs/operators";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-symbols-section",
    styleUrls: ["symbols.component.scss"],
    providers: [
        {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SymbolsComponent), multi: true}
    ],
    template: `
        <div class="form-group" *ngIf="symbolsForm">
            <form>
                <label>Symbols</label>
                <ct-compact-list *ngIf="symbolsForm"
                                 [addKeyCode]="13"
                                 [readonly]="readonly"
                                 [formControl]="symbolsForm">
                </ct-compact-list>

            </form>
        </div>
    `
})
export class SymbolsComponent extends DirectiveBase implements ControlValueAccessor {

    @Input()
    readonly = false;

    private onTouched = noop;

    private propagateChange = noop;

    symbolsForm: FormControl;

    writeValue(symbols: string[]): void {
        this.symbolsForm = new FormControl(symbols || []);

        this.listenToFormChanges();
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    private listenToFormChanges(): void {

        this.symbolsForm.valueChanges.pipe(
            debounceTime(300)
        ).subscribeTracked(this, symbols => this.propagateChange(symbols));
    }
}
