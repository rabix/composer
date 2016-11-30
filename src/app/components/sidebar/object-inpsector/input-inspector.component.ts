import {Component, OnInit, OnDestroy} from "@angular/core";
import {ExpressionInputComponent} from "../../../editor-common/components/expression-input/expression-input.component";
import {InputSidebarService, InputInspectorData} from "../../../services/sidebars/input-sidebar.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ComponentBase} from "../../common/component-base";
import {BasicInputSectionComponent} from "../../../tool-editor/object-inspector/basic-section/basic-input-section.component";
import {InputDescriptionComponent} from "../../../tool-editor/object-inspector/input-description/input-description.component";
import {StageInputSectionComponent} from "../../../tool-editor/object-inspector/stage-input-section/stage-input-section.component";
import {CommandInputParameterModel as InputProperty} from "cwlts/models/d2sb";

require("./input-inspector.component.scss");

@Component({
    selector: "input-inspector",
    directives: [
        ExpressionInputComponent,
        BasicInputSectionComponent,
        InputDescriptionComponent,
        StageInputSectionComponent
    ],
    template: `
            <form class="input-inspector-component object-inspector" *ngIf="inputInspectorFormGroup">
                <div>
                    <span class="input-text">Input</span>
                    <i class="fa fa-info-circle info-icon"></i>
                </div>
            
                <basic-input-section [formControl]="inputInspectorFormGroup.controls['basicInputSection']"
                                     [context]="context">
                </basic-input-section>
                
                <input-description [formControl]="inputInspectorFormGroup.controls['description']"></input-description>
                
                <stage-input [formControl]="inputInspectorFormGroup.controls['stageInputSection']"></stage-input>
            </form>
    `
})
export class InputInspectorComponent extends ComponentBase implements OnInit, OnDestroy {

    private context: any;

    private input: InputProperty;

    private inputInspectorFormGroup: FormGroup;

    constructor(private inputSidebarService: InputSidebarService,
                private formBuilder: FormBuilder) {
        super();
    }

    ngOnInit(): void {
        this.tracked = this.inputSidebarService.inputInspectorDataStream
            .mergeMap((data: InputInspectorData) => {
                this.context = data.context;
                this.input = data.inputProperty;

                this.inputInspectorFormGroup = this.formBuilder.group({
                    basicInputSection: [data.inputProperty],
                    description: [data.inputProperty],
                    stageInputSection: [data.inputProperty]
                });

                return this.inputInspectorFormGroup.valueChanges;
            })
            .distinctUntilChanged()
            .subscribe(_ => {
                this.inputSidebarService.updateInputPort(this.input)
            });
    }
}
