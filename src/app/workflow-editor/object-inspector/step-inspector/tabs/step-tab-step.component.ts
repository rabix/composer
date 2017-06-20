import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges,
    ViewEncapsulation
} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Workflow} from "cwl-svg";
import {StepModel, WorkflowModel} from "cwlts/models";
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
                   [formControl]="form.controls['id']"
                   [readonly]="readonly">
            <div *ngIf="form.controls['id'].errors" class="form-control-feedback">
                {{form.controls['id'].errors['error']}}
            </div>
        </div>

        <!--Label-->
        <div class="form-group">
            <label class="form-control-label">Label</label>
            <input type="text"
                   class="form-control"
                   [formControl]="form.controls['label']"
                   [readonly]="readonly">
        </div>

        <!--Scatter Method-->
        <div *ngIf="step.hasScatterMethod" class="form-group">
            <label class="form-control-label">Scatter Method</label>
            <select class="form-control"
                    [formControl]="form.controls['scatterMethod']">
                <option *ngFor="let method of scatterMethodOptions" [value]="method.value">
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
                    [formControl]="form.controls['scatter']">
                <option value="">-- none --</option>
                <option *ngFor="let input of step.in" [value]="input.id">
                    {{input.label}} (#{{input.id}})
                </option>
            </select>

            <!--Multiple Scatter-->
            <select *ngIf="step.hasMultipleScatter"
                    class="form-control"
                    multiple
                    [formControl]="form.controls['scatter']">
                <option *ngFor="let opt of step.in" [value]="opt.id">
                    {{opt.id}}
                </option>
            </select>

        </div>

        <!--Description-->
        <div class="form-group">
            <label class="form-control-label">Description</label>
            <textarea class="form-control"
                      rows="4"
                      [formControl]="form.controls['description']"
                      [readonly]="readonly"></textarea>
        </div>

    `
})
export class WorkflowStepInspectorTabStep extends DirectiveBase implements OnInit, OnChanges {

    @Input()
    public readonly = false;

    @Input()
    public step: StepModel;

    @Input()
    public workflowModel: WorkflowModel;

    @Input()
    public graph: Workflow;

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

    constructor(private formBuilder: FormBuilder, private cdr: ChangeDetectorRef) {
        super();
    }

    ngOnChanges(changes: SimpleChanges): void {

        if (this.form && changes["step"]) {
            const newStep = changes["step"].currentValue;

            this.form.controls["id"].setValue(newStep.id);
            this.form.controls["label"].setValue(newStep.label);
            this.form.controls["description"].setValue(newStep.description);
            this.form.controls["scatterMethod"].setValue(newStep.scatterMethod);
            this.form.controls["scatter"].setValue(newStep.scatter || "");

            this.disableScatter();
        }
    }

    ngOnInit() {

        this.form = this.formBuilder.group({
            id: [this.step.id],
            label: [this.step.label],
            description: [this.step.description],
            scatterMethod: [this.step.scatterMethod],
            scatter: [this.step.scatter || ""]
        });

        this.disableScatter();

        this.tracked = this.form.controls["id"].valueChanges.debounceTime(1000).subscribe((value) => {
            try {
                // Change id on workflow model so canvas can interact with it
                this.workflowModel.changeStepId(this.step, value);
                this.graph.redraw();
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
            this.graph.redraw();
        });

        this.tracked = this.form.controls["scatter"].valueChanges.subscribe((scatter) => {
            this.step.scatter = scatter;
        });

        this.tracked = this.form.controls["scatterMethod"].valueChanges.subscribe((scatterMethod) => {
            this.step.scatterMethod = scatterMethod;
        });

    }

    disableScatter() {
        // using [disabled] doesn't work for whatever reason
        // binding readonly to [attr.disabled] makes the select ALWAYS disabled
        // because it has the disabled attribute, regardless if it's true or false
        if (this.readonly) {
            this.form.controls["scatter"].disable();
            this.form.controls["scatterMethod"].disable();
        } else {
            this.form.controls["scatter"].enable();
            this.form.controls["scatterMethod"].enable();
        }
    }

}
