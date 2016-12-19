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
                            [formControl]="baseCommandForm.controls[item.id]">
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
            
            <hr>
            <div class="row">
                <div class="col-xs-12">
                    <h3 class="gui-section-header mb-1">
                        Streams
                    </h3>
                </div>
            </div>
            <div class="row">
                <div class="col-xs-6">
                    <label class="form-control-label">Stdin redirect</label>
                    <ct-expression-input [formControl]="streamsForm.controls['stdin']"></ct-expression-input>
                </div>
                <div class="col-xs-6">
                    <label class="form-control-label">Stdout redirect</label>
                    <ct-expression-input [formControl]="streamsForm.controls['stdout']"></ct-expression-input>
                </div>
            </div>
            
        </form>
    </div>
</ct-form-panel>

    `
})
export class BaseCommandFormComponent extends ComponentBase implements OnInit, OnDestroy {
    /** baseCommand property of model */
    @Input()
    public baseCommand: ExpressionModel[];

    /** Stdin property of model */
    @Input()
    public stdin: ExpressionModel;

    /** Stdout property of model */
    @Input()
    public stdout: ExpressionModel;

    /** The parent forms group which is already in the clt-editor form tree */
    @Input()
    public form: FormGroup;

    /** Update event triggered on command form changes (add, remove, edit) */
    @Output()
    public updateCmd = new ReplaySubject<ExpressionModel[]>();

    /** Update event triggered on stream changes */
    @Output()
    public updateStreams = new ReplaySubject<ExpressionModel[]>();

    /** Context in which expression should be evaluated */
    @Input()
    public context: {$job: any};

    /** form group for streams */
    private streamsForm: FormGroup;

    /** form group for base command */
    private baseCommandForm: FormGroup;

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

        this.streamsForm = new FormGroup({
            stdin: new FormControl(this.stdin),
            stdout: new FormControl(this.stdout)
        });

        this.baseCommandForm = new FormGroup({});

        this.formList.forEach((item) => {
            this.baseCommandForm.addControl(
                item.id,
                new FormControl(item.model, [Validators.required])
            );
        });

        this.form.addControl("streams", this.streamsForm);
        this.form.addControl("baseCommand", this.baseCommandForm);

        this.tracked = this.baseCommandForm.valueChanges.subscribe(change => {
            const v = Object.keys(change).map(key => change[key]);
            this.updateCmd.next(v);
        });

        this.tracked = this.streamsForm.valueChanges.subscribe(change => {
            this.updateStreams.next(change);
        });
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
        this.form.removeControl("baseCommand");
        this.form.removeControl("streams");
    }
}
