import {Component, Input, Output, ViewEncapsulation, OnInit} from "@angular/core";
import {CommandInputParameterModel, CommandLineToolModel} from "cwlts/models";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Subject} from "rxjs/Subject";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-tool-input-inspector",
    template: `
        <form [formGroup]="form">

            <ct-basic-input-section [formControl]="form.controls['basicInputSection']"
                                    [context]="context"
                                    [model]="model"
                                    [readonly]="readonly">
            </ct-basic-input-section>

            <ct-description-section [formControl]="form.controls['description']"
                                    [readonly]="readonly">
            </ct-description-section>

        </form>
    `
})
export class ToolInputInspectorComponent extends DirectiveBase implements OnInit {

    @Input()
    input: CommandInputParameterModel;

    /** Context in which expression should be evaluated */
    @Input()
    model: CommandLineToolModel;

    @Input()
    readonly = false;

    form: FormGroup;

    context: any;

    @Output()
    save = new Subject<CommandInputParameterModel>();

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    ngOnInit() {
        this.context = this.model.getContext(this.input.id);

        this.form    = this.formBuilder.group({
            basicInputSection: this.input,
            description: this.input,
            stageInputSection: this.input
        });

        this.tracked = this.form.valueChanges.skip(1).subscribe(() => {
            this.save.next(this.input);
        });
    }
}
