import {Component, Input, Output, ViewEncapsulation} from "@angular/core";
import {CommandInputParameterModel} from "cwlts/models";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Subject} from "rxjs";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

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
export class ToolInputInspector extends DirectiveBase {

    @Input()
    public input: CommandInputParameterModel;

    /** Context in which expression should be evaluated */
    @Input()
    public context: { $job?: any, $self?: any } = {};

    @Input()
    public readonly = false;

    public form: FormGroup;

    @Output()
    public save = new Subject<CommandInputParameterModel>();

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    ngOnInit() {
        this.form = this.formBuilder.group({
            basicInputSection: this.input,
            description: this.input,
            stageInputSection: this.input
        });


        // Skipping 1 because the first changes are from the form initializing
        this.tracked = this.form.valueChanges.skip(1).subscribe(() => {
            this.save.next(this.input);
        });
    }

    private onSubmit(form: FormGroup) {
        this.save.next(form.value);
    }
}
