import {Component, forwardRef, Input} from "@angular/core";
import {
    ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup,
    FormControl, Validators
} from "@angular/forms";
import {ComponentBase} from "../../../components/common/component-base";
import {CommandOutputParameterModel as OutProperty} from "cwlts/models/d2sb";
import {ExpressionModel} from "cwlts/models/d2sb";
import {GuidService} from "../../../services/guid.service";
import {CustomValidators} from "../../../validators/custom.validator";

@Component({
    selector: 'secondary-file',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SecondaryFilesComponent), multi: true }
    ],
    template: `
<ct-form-panel [borderless]="true" [collapsed]="true">
    <div class="tc-header">Secondary files</div>
    <div class="tc-body" *ngIf="output && secondaryFilesFormGroup">    
        <form *ngIf="secondaryFilesFormGroup" [formGroup]="secondaryFilesFormGroup">

            <ol *ngIf="formList.length > 0" class="list-unstyled">

                <li *ngFor="let item of formList"
                     class="removable-form-control">

                    <ct-expression-input
                            [context]="context"                            
                            [formControl]="secondaryFilesFormGroup.controls[item.id]">
                    </ct-expression-input>

                    <div class="remove-icon clickable" (click)="removeSecondaryFile(item)">
                        <i class="fa fa-trash"></i>
                    </div>
                </li> 
            </ol>

            <div *ngIf="formList.length === 0">
                No Secondary Files defined.
            </div>

            <button type="button" class="btn btn-link add-btn-link no-underline-hover" (click)="addSecondaryFile()">
                <i class="fa fa-plus"></i> Add secondary file
            </button>
        </form>                          
                  
        <div class="secondary-text">
            If a tool created index files, list them here.
        </div>        
       
    </div> <!--tc-body-->
</ct-form-panel>
    `
})

/**
 * TODO: add the load content property on the model
 * */
export class SecondaryFilesComponent extends ComponentBase implements ControlValueAccessor {

    private output: OutProperty;

    private onTouched = () => { };

    private propagateChange = (_) => {};

    private secondaryFilesFormGroup: FormGroup;

    /** List which connects model to forms */
    private formList: Array<{id: string, model: ExpressionModel}> = [];

    constructor(private guidService: GuidService) {
        super();
    }

    writeValue(output: OutProperty): void {
        this.output = output;

        debugger;

        this.secondaryFilesFormGroup = new FormGroup({});

        this.formList = this.output.outputBinding.secondaryFiles.map(model => {
            return {
                id: this.guidService.generate(), model
            };
        });

        this.formList.forEach((item) => {
            this.secondaryFilesFormGroup.addControl(
                item.id,
                new FormControl(item.model, [Validators.required])
            );
        });

        this.tracked = this.secondaryFilesFormGroup.valueChanges
            .distinctUntilChanged()
            .subscribe(change => {

                this.output.outputBinding.secondaryFiles = Object.keys(change).map(key => change[key]);

                this.propagateChange(this.output);
            });
    }

    private addSecondaryFile(): void {
        const newCmd = {
            id: this.guidService.generate(),
            model: new ExpressionModel("", "")
        };

        this.secondaryFilesFormGroup.addControl(newCmd.id, new FormControl(newCmd.model, [Validators.required, CustomValidators.cwlModel]));
        this.formList.push(newCmd);
        this.secondaryFilesFormGroup.markAsTouched();
    }

    private removeSecondaryFile(ctrl: {id: string, model: ExpressionModel}): void {
        this.formList = this.formList.filter(item => item.id !== ctrl.id);
        this.secondaryFilesFormGroup.removeControl(ctrl.id);
        this.secondaryFilesFormGroup.markAsDirty();
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
}
