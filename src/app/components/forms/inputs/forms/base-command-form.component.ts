import {Component, Input, OnInit, OnDestroy, Output} from "@angular/core";
import {FormGroup, Validators, FormControl} from "@angular/forms";
import {ExpressionModel} from "cwlts/models/d2sb";
import {ReplaySubject} from "rxjs";
import {ComponentBase} from "../../../common/component-base";
import {GuidService} from "../../../../services/guid.service";
import {CustomValidators} from "../../../../validators/custom.validator";

require("./base-command-form.components.scss");

@Component({
    selector: 'base-command-form',
    template: `<ct-form-panel>
    <div class="tc-header">
        Base Command
    </div>
    <div class="tc-body">
        <form *ngIf="form" [formGroup]="form">

            <ol *ngIf="formList.length > 0" class="list-unstyled">

                <li *ngFor="let item of formList"
                     class="removable-form-control">

                    <ct-expression-input
                            [context]="context"                            
                            [formControl]="form.controls[item.id]">
                    </ct-expression-input>

                    <div class="remove-icon clickable" (click)="removeBaseCommand(item)">
                        <i class="fa fa-trash"></i>
                    </div>
                </li> 
            </ol>

            <div *ngIf="formList.length === 0">
                No baseCommand defined.
            </div>

            <button type="button" class="btn btn-link add-btn-link no-underline-hover" (click)="addBaseCommand()">
                <i class="fa fa-plus"></i> Add base command
            </button>
        </form>
    </div>
</ct-form-panel>

    `
})
export class BaseCommandFormComponent extends ComponentBase implements OnInit, OnDestroy {
    /** baseCommand property of model */
    @Input()
    public baseCommand: ExpressionModel[];

    /** The parent forms group which is already in the clt-editor form tree */
    @Input()
    public form: FormGroup;

    /** Update event triggered on form changes (add, remove, edit) */
    @Output()
    public update = new ReplaySubject<ExpressionModel[]>();

    /** Context in which expression should be evaluated */
    @Input()
    public context: {$job: any};

    /** List which connects model to forms */
    private formList: Array<{id: string, model: ExpressionModel}> = [];

    constructor(private guidService: GuidService) {
        super();
    }

    ngOnInit(): void {
        this.formList = this.baseCommand.map(model => {
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
            const v = Object.keys(change).map(key => change[key]);
            this.update.next(v);
        })
    }

    private removeBaseCommand(ctrl: {id: string, model: ExpressionModel}): void {
        this.formList = this.formList.filter(item => item.id !== ctrl.id);
        this.form.removeControl(ctrl.id);
        this.form.markAsDirty();
    }

    private addBaseCommand(): void {
        const newCmd = {
            id: this.guidService.generate(),
            model: new ExpressionModel("", "")
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
