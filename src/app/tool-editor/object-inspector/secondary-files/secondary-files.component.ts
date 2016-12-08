import {Component, forwardRef, Input} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl} from "@angular/forms";
import {ComponentBase} from "../../../components/common/component-base";
import {CommandInputParameterModel as InputProperty} from "cwlts/models/d2sb";
import {FormPanelComponent} from "../../../core/elements/form-panel.component";
import {ExpressionModelListComponent} from "../../../editor-common/components/expression-model-list/expression-model-list.componen";

@Component({
    selector: 'secondary-files',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SecondaryFilesComponent), multi: true }
    ],
    directives: [
        FormPanelComponent,
        ExpressionModelListComponent
    ],
    template: `
<ct-form-panel *ngIf="input.type.type === 'File'">
    <div class="tc-header">Secondary Files</div>
    <div class="tc-body" *ngIf="form">
    
            <expression-model-list 
                [context]="context"
                [emptyListText]="'No files defined.'"
                [addButtonText]="'Add secondary file'"
                [formControl]="form"></expression-model-list>
    </div>
</ct-form-panel>
    `
})

export class SecondaryFilesComponent extends ComponentBase implements ControlValueAccessor {

    /** Context in which expression should be evaluated */
    @Input()
    public context: {$job: any} = {};

    private input: InputProperty;

    private onTouched = () => { };

    private propagateChange = (_) => {};

    private form: FormControl;

    private writeValue(input: InputProperty): void {
        this.input = input;

        //TODO: load secondary files
        this.form = new FormControl([]);

        this.tracked = this.form.valueChanges.subscribe(change => {
            console.log(change);

            //TODO: propagate
            //this.propagateChange(change);
        });
    }

    private registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    private registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
}
