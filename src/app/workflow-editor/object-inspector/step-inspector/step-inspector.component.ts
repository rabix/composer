import {Component, Input, Output} from "@angular/core";
import {CommandInputParameterModel} from "cwlts/models/d2sb";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Subject} from "rxjs";
import {ComponentBase} from "../../../components/common/component-base";
import {StepModel} from "cwlts/models";

@Component({
    selector: "ct-workflow-step-inspector",
    template: `        
        <h3>In ports</h3>
        <div class="gui-section-list-title row">
            <div class="col-sm-6">ID</div>
            <div class="col-sm-6">Source</div>
        </div>
        
        <ul *ngFor="let i of step.in" class="col-sm-12">
            <li class="gui-section-list-item row">
                <div class="col-sm-6 ellipsis" [title]="i.id">{{ i.id }}</div>
                <div class="col-sm-6 ellipsis" [title]="i.source">{{ i.source }}</div>
            </li>
        </ul>
        
        <h3>Out ports</h3>
        
        <ul *ngFor="let o of step.out" class="col-sm-12">
            <li class="gui-section-list-item row">
                <div class="col-sm-12"> {{ o.id }}
                </div>
            </li>
        </ul>
`
})
export class WorkflowStepInspector extends ComponentBase {

    @Input()
    public step: StepModel;

    @Output()
    public save = new Subject<CommandInputParameterModel>();

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    ngOnInit() {
    }

    private onSubmit(form: FormGroup) {
    }
}
