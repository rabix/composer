import {Component, Input, Output} from "@angular/core";
import {CommandInputParameterModel} from "cwlts/models/d2sb";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Subject} from "rxjs";
import {ComponentBase} from "../../../components/common/component-base";
import {ExpressionInputComponent} from "../../../editor-common/components/expression-input/expression-input.component";
import {BasicInputSectionComponent} from "../../../tool-editor/object-inspector/basic-section/basic-input-section.component";
import {InputDescriptionComponent} from "../../../tool-editor/object-inspector/input-description/input-description.component";
import {StageInputSectionComponent} from "../../../tool-editor/object-inspector/stage-input-section/stage-input-section.component";
import {SecondaryFilesComponent} from "../../object-inspector/secondary-files/secondary-files.component";

@Component({
    selector: "ct-tool-input-inspector",
    directives: [
        ExpressionInputComponent,
        BasicInputSectionComponent,
        InputDescriptionComponent,
        StageInputSectionComponent,
        SecondaryFilesComponent
    ],
    template: `
        <form [formGroup]="form" (ngSubmit)="onSubmit(form)">
        
            <basic-input-section [formControl]="form.controls['basicInputSection']"
                                 [context]="context">
            </basic-input-section>
            
            <input-description [formControl]="form.controls['description']"></input-description>
            
            <stage-input [formControl]="form.controls['stageInputSection']"></stage-input>
           
            <secondary-files [formControl]="form.controls['secondaryFilesSection']"
                             [context]="context"></secondary-files>
        </form>
`
})
export class ToolInputInspector extends ComponentBase {

    @Input()
    public input: CommandInputParameterModel;

    /** Context in which expression should be evaluated */
    @Input()
    public context: {$job: any, $self: any} = {};

    private form: FormGroup;

    @Output()
    public save = new Subject<CommandInputParameterModel>();

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    ngOnInit() {
        this.form = this.formBuilder.group({
            basicInputSection: this.input,
            description: this.input,
            stageInputSection: this.input,
            secondaryFilesSection: this.input,
        });


        this.tracked = this.form.valueChanges.subscribe(_ => {
            this.save.next(this.input);
        });
    }

    private onSubmit(form: FormGroup) {
        this.save.next(form.value);
    }
}
