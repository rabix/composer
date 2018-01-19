import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewEncapsulation
} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Workflow} from "cwl-svg";
import {StepModel, WorkflowModel} from "cwlts/models";
import {HintsModalComponent} from "../../../../core/modals/hints-modal/hints-modal.component";
import {ModalService} from "../../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../../util/directive-base/directive-base";

@Component({
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "ct-workflow-step-inspector-step",
    template: `
        <!--ID-->
        <div class="form-group" [class.has-danger]="form.controls['id'].errors">
            <label class="form-control-label">ID</label>
            <input type="text"
                   class="form-control"
                   data-test="id-field"
                   [formControl]="form.controls['id']">
            <div *ngIf="form.controls['id'].errors" class="form-control-feedback">
                {{form.controls['id'].errors['error']}}
            </div>
        </div>

        <!--Label-->
        <div class="form-group">
            <label class="form-control-label">Label</label>
            <input type="text"
                   class="form-control"
                   data-test="label-field"
                   [formControl]="form.controls['label']">
        </div>

        <!--Scatter Method-->
        <div *ngIf="step.hasScatterMethod" class="form-group">
            <label class="form-control-label">Scatter Method</label>
            <select class="form-control"
                    data-test="scatter-method-select"
                    [formControl]="form.controls['scatterMethod']">
                <option value=""
                        [disabled]="readonly">-- none --</option>
                <option *ngFor="let method of scatterMethodOptions" 
                        [disabled]="readonly"
                        [value]="method.value">
                    {{method.caption}}
                </option>
            </select>
        </div>

        <!--Scatter-->
        <div class="form-group">

            <label class="form-control-label">Scatter</label>

            <!--Single Scatter-->
            <select *ngIf="!step.hasMultipleScatter"
                    class="form-control"
                    data-test="scatter-select"
                    [formControl]="form.controls['scatter']">
                <option value=""
                        [disabled]="readonly">-- none --</option>
                <option *ngFor="let input of step.in"
                        [disabled]="readonly"
                        [value]="input.id">
                    {{input.label}} (#{{input.id}})
                </option>
            </select>

            <!--Multiple Scatter-->
            <select *ngIf="step.hasMultipleScatter"
                    class="form-control"
                    multiple
                    data-test="scatter-select"
                    [formControl]="form.controls['scatter']">
                <option *ngFor="let opt of step.in"
                        [disabled]="readonly"
                        [value]="opt.id">
                    {{opt.id}}
                </option>
            </select>

        </div>

        <!--Description-->
        <div class="form-group">
            <label class="form-control-label">Description</label>
            <textarea class="form-control"
                      rows="4"
                      data-test="desc-field"
                      [formControl]="form.controls['description']"></textarea>
        </div>

        <!--Set Hints-->
        <button type="button" class="btn btn-secondary" data-test="set-hints-button" (click)="setHints()">{{ this.readonly ? "View" : "Set" }} Hints</button>

    `
})
export class WorkflowStepInspectorTabStep extends DirectiveBase implements OnInit, OnChanges {

    disabled = false;

    get readonly(): boolean {
        return this.disabled;
    }

    @Input("readonly")
    set readonly(value: boolean) {
        this.disabled = value;
        if (this.form) {
            this.setDisabledState(value);
        }
    }

    @Input()
    public step: StepModel;

    @Input()
    public workflowModel: WorkflowModel;

    @Input()
    public graph: Workflow;

    @Output()
    public change = new EventEmitter();

    public scatterMethodOptions = [
        {
            value: "dotproduct",
            caption: "Dot Product"
        },
        {
            value: "nested_crossproduct",
            caption: "Nested Cross Product"
        },
        {
            value: "flat_crossproduct",
            caption: "Flat Cross Product"
        }
    ];

    public form: FormGroup;

    constructor(private formBuilder: FormBuilder, private cdr: ChangeDetectorRef, private modal: ModalService) {
        super();
    }

    ngOnChanges(changes: SimpleChanges): void {

        if (this.form && changes["step"]) {
            const newStep = changes["step"].currentValue;

            this.form.controls["id"].setValue(newStep.id);
            this.form.controls["label"].setValue(newStep.label);
            this.form.controls["description"].setValue(newStep.description);
            this.form.controls["scatterMethod"].setValue(newStep.scatterMethod || "");
            this.form.controls["scatter"].setValue(newStep.scatter || "");
        }
    }

    ngOnInit() {

        this.form = this.formBuilder.group({
            id: [{value: this.step.id, disabled: this.readonly}],
            label: [{value: this.step.label, disabled: this.readonly}],
            description: [{value: this.step.description, disabled: this.readonly}],
            scatterMethod: [this.step.scatterMethod || ""],
            scatter: [this.step.scatter || ""]
        });

        this.tracked = this.form.valueChanges.debounceTime(200).subscribe(() => {
           this.change.emit();
        });

        this.tracked = this.form.controls["id"].valueChanges.debounceTime(1000).subscribe((value) => {
            try {
                // Change id on workflow model so canvas can interact with it
                this.workflowModel.changeStepId(this.step, value);
                this.graph.draw();
            } catch (e) {
                this.form.controls["id"].setErrors({error: e.message});
                // Because this comes outside of Angular (workflow model)
                this.cdr.markForCheck();
            }
        });

        this.tracked = this.form.controls["description"].valueChanges.subscribe((description) => {
            this.step.description = description;
        });

        this.tracked = this.form.controls["label"].valueChanges.debounceTime(1000).subscribe((label) => {
            this.step.label = label;
        });

        this.tracked = this.form.controls["scatter"].valueChanges.subscribe((scatter) => {
            this.step.scatter = scatter;
        });

        this.tracked = this.form.controls["scatterMethod"].valueChanges.subscribe((scatterMethod) => {
            this.step.scatterMethod = scatterMethod;
        });

    }

    setHints() {
        const hints = this.modal.fromComponent(HintsModalComponent, {
            title: "Set Hints",
            backdrop: true,
            closeOnEscape: true
        });

        hints.model = this.step;
        hints.readonly = this.readonly;
    }

    setDisabledState(isDisabled: boolean) {
        const excludedControls = ["scatter", "scatterMethod"];
        Object.keys(this.form.controls).filter(c => excludedControls.indexOf(c) === -1).forEach((item) => {
            const control = this.form.controls[item];
            isDisabled ? control.disable({emitEvent: false}) : control.enable({emitEvent: false});
        });
    }
}
