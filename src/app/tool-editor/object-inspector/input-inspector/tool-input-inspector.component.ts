import {Component, Input, Output, ViewEncapsulation} from "@angular/core";
import {SBDraft2CommandInputParameterModel} from "cwlts/models/d2sb";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Subject} from "rxjs";
import {ComponentBase} from "../../../components/common/component-base";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-tool-input-inspector",
    template: `
        <form [formGroup]="form" (ngSubmit)="onSubmit(form)">

            <ct-basic-input-section [formControl]="form.controls['basicInputSection']"
                                    [context]="context"
                                    [readonly]="readonly">
            </ct-basic-input-section>

            <ct-description-section [formControl]="form.controls['description']"
                                    [readonly]="readonly">
            </ct-description-section>

        </form>
    `
})
export class ToolInputInspector extends ComponentBase {

    @Input()
    public input: SBDraft2CommandInputParameterModel;

    /** Context in which expression should be evaluated */
    @Input()
    public context: { $job?: any, $self?: any } = {};

    @Input()
    public readonly = false;

    private form: FormGroup;

    @Output()
    public save = new Subject<SBDraft2CommandInputParameterModel>();

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    ngOnInit() {
        this.form = this.formBuilder.group({
            basicInputSection: this.input,
            description: this.input,
            stageInputSection: this.input
        });


        this.tracked = this.form.valueChanges.subscribe(() => {
            this.save.next(this.input);
        });
    }

    private onSubmit(form: FormGroup) {
        this.save.next(form.value);
    }
}
