import {Component, Input, forwardRef} from "@angular/core";
import {Validators, FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup} from "@angular/forms";
import {ExpressionModel} from "cwlts/models/d2sb";
import {ComponentBase} from "../../../components/common/component-base";
import {GuidService} from "../../../services/guid.service";
import {CustomValidators} from "../../../validators/custom.validator";
import {noop} from "../../../lib/utils.lib";
import {ModalService} from "../../../components/modal/modal.service";

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
                            [formControl]="form.controls[item.id]"
                            [readonly]="readonly">
                    </ct-expression-input>

                    <div *ngIf="!readonly" class="remove-icon clickable"  (click)="removeExpressionModel(item)">
                        <i [ct-tooltip]="'Delete'" class="fa fa-trash text-hover-danger"></i>
                    </div>
                </li> 
            </ol>

            <ct-blank-tool-state *ngIf="!formList.length"
                         [title]="emptyListText"
                         [buttonText]="addButtonText"
                         [readonly]="readonly"
                         (buttonClick)="addExpressionModel()">
            </ct-blank-tool-state>

            <button type="button" *ngIf="formList.length && !readonly" class="btn btn-link add-btn-link no-underline-hover"
                         (click)="addExpressionModel()">
                <i class="fa fa-plus"></i> {{addButtonText}}
            </button>
    </form>
`
})
export class ExpressionModelListComponent extends ComponentBase implements ControlValueAccessor {

    @Input()
    public readonly = false;

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

    constructor(private guidService: GuidService, private modal: ModalService) {
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
        this.modal.confirm({
            title: "Really Remove?",
            content: `Are you sure that you want to remove this secondary file?`,
            cancellationLabel: "No, keep it",
            confirmationLabel: "Yes, remove it"
        }).then(() => {
            this.formList = this.formList.filter(item => item.id !== ctrl.id);
            this.form.removeControl(ctrl.id);
            this.form.markAsDirty();
        }, noop);
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
