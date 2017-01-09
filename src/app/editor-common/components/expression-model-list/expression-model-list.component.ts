import {Component, Input, forwardRef} from "@angular/core";
import {Validators, FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup} from "@angular/forms";
import {ExpressionModel} from "cwlts/models/d2sb";
import {ComponentBase} from "../../../components/common/component-base";
import {GuidService} from "../../../services/guid.service";
import {CustomValidators} from "../../../validators/custom.validator";
import {noop} from "../../../lib/utils.lib";

@Component({
    selector: 'expression-model-list',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ExpressionModelListComponent), multi: true }
    ],
    template: `
        <form *ngIf="form" [formGroup]="form">

            <ol *ngIf="formList.length > 0" class="list-unstyled">

                <li *ngFor="let item of formList"
                     class="removable-form-control">

                    <ct-expression-input
                            [context]="context"
                            [formControl]="form.controls[item.id]">
                    </ct-expression-input>

                    <div class="remove-icon clickable" (click)="removeExpressionModel(item)">
                        <i class="fa fa-trash"></i>
                    </div>
                </li> 
            </ol>

            <div *ngIf="formList.length === 0">
                {{emptyListText}}
            </div>

            <button type="button" class="btn btn-link add-btn-link no-underline-hover" (click)="addExpressionModel()">
                <i class="fa fa-plus"></i> {{addButtonText}}
            </button>
    </form>
`
})
export class ExpressionModelListComponent extends ComponentBase implements ControlValueAccessor {

    @Input()
    public addButtonText: string = "";

    @Input()
    public emptyListText: string = "";

    /** Context in which expression should be evaluated */
    @Input()
    public context: {$job: any} = { $job: {} };

    /** List which connects model to forms */
    private formList: Array<{id: string, model: ExpressionModel}> = [];

    private onTouched = noop;

    private propagateChange = noop;

    private input: ExpressionModel[];

    private form: FormGroup = new FormGroup({});

    constructor(private guidService: GuidService) {
        super();
    }

    writeValue(input: ExpressionModel[]): void {
        this.input = input;

        this.formList = this.input.map(model => {
            return {
                id: this.guidService.generate(), model
            };
        });

        this.formList.forEach((item) => {
            this.form.addControl(
                item.id,
                new FormControl(item.model, [Validators.required])
            );
        });

        this.tracked = this.form.valueChanges.subscribe(change => {
            const values = Object.keys(change).map(key => change[key]);
            this.propagateChange(values);
        })
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    private removeExpressionModel(ctrl: {id: string, model: ExpressionModel}): void {
        this.formList = this.formList.filter(item => item.id !== ctrl.id);
        this.form.removeControl(ctrl.id);
        this.form.markAsDirty();
    }

    private addExpressionModel(): void {
        const newCmd = {
            id: this.guidService.generate(),
            model: new ExpressionModel("")
        };

        this.form.addControl(newCmd.id, new FormControl(newCmd.model, [Validators.required, CustomValidators.cwlModel]));
        this.formList.push(newCmd);

        this.form.markAsTouched();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.formList.forEach(item => this.form.removeControl(item.id));
    }
}
