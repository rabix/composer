import {Component, forwardRef, Input} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl} from "@angular/forms";
import {ComponentBase} from "../../../components/common/component-base";
import {ExpressionModel} from "cwlts/models/d2sb";
import {noop} from "../../../lib/utils.lib";

@Component({
    selector: 'ct-secondary-file',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SecondaryFilesComponent), multi: true }
    ],
    template: `
<ct-form-panel class="borderless" *ngIf="form" [collapsed]="true">
    <div class="tc-header">Secondary Files</div>
    <div class="tc-body">

        <expression-model-list
            [context]="context"
            [emptyListText]="'No Secondary Files defined.'"
            [addButtonText]="'Add secondary file'"
            [readonly]="readonly"
            [formControl]="form"></expression-model-list>
    </div>
</ct-form-panel>
    `
})

export class SecondaryFilesComponent extends ComponentBase implements ControlValueAccessor {

    @Input()
    public readonly = false;

    /** Context in which expression should be evaluated */
    @Input()
    public context: {$job: any} = { $job: {} };

    private secondaryFiles: ExpressionModel[];

    private onTouched = noop;

    private propagateChange = noop;

    private form: FormControl;

    writeValue(secondaryFiles: ExpressionModel[]): void {
        this.secondaryFiles = secondaryFiles;

        this.form = new FormControl(this.secondaryFiles);

        this.tracked = this.form.valueChanges.subscribe((fileList: ExpressionModel[]) => {
            this.propagateChange(fileList);
        });
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
}
