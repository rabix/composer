import {Component, Input, Output} from "@angular/core";
import {CommandInputParameterModel} from "cwlts/models/d2sb";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Subject} from "rxjs";
import {ComponentBase} from "../../../components/common/component-base";

@Component({
    selector: "ct-tool-input-inspector",
    template: `
        <form [formGroup]="form" (ngSubmit)="onSubmit(form)">
        
            <ct-basic-input-section [formControl]="form.controls['basicInputSection']"
                                 [context]="context">
            </ct-basic-input-section>
            
            <ct-description-section [formControl]="form.controls['description']"></ct-description-section>
            
            <ct-stage-input [formControl]="form.controls['stageInputSection']"></ct-stage-input>
        </form>
`
})
export class ToolInputInspector extends ComponentBase {

    @Input()
    public input: CommandInputParameterModel;

    /** Context in which expression should be evaluated */
    @Input()
    public context: {$job?: any, $self?: any} = {};

    private form: FormGroup;

    @Output()
    public save = new Subject<CommandInputParameterModel>();

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    ngOnInit() {
        this.form = this.formBuilder.group({
            basicInputSection: this.input,
            description: this.input
        });


        this.tracked = this.form.valueChanges.subscribe(_ => {
            this.save.next(this.input);
        });
    }

    private onSubmit(form: FormGroup) {
        this.save.next(form.value);
    }
}
