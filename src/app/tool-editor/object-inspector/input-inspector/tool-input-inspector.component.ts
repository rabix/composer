import {Component, Input, OnInit, Output, ViewEncapsulation} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CommandInputParameterModel, CommandLineToolModel} from "cwlts/models";
import {Subject} from "rxjs/Subject";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-tool-input-inspector",
    template: `
        <form [formGroup]="form">

            <ct-basic-input-section [formControl]="form.controls['basicInputSection']"
                                    [context]="context"
                                    [model]="model">
            </ct-basic-input-section>

            <ct-description-section [formControl]="form.controls['description']">
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

    disabled = false;

    get readonly(): boolean {
        return this.disabled;
    }

    @Input("readonly")
    set readonly(value: boolean) {
        this.disabled = value;
        if (this.form) {
            if (this.disabled) {
                this.form.controls["basicInputSection"].disable({onlySelf: true, emitEvent: false});
                this.form.controls["description"].disable({onlySelf: true, emitEvent: false});
            } else {
                this.form.controls["basicInputSection"].enable({onlySelf: true, emitEvent: false});
                this.form.controls["description"].enable({onlySelf: true, emitEvent: false});
            }
        }
    }

    form: FormGroup;

    context: any;

    @Output()
    save = new Subject<CommandInputParameterModel>();

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    ngOnInit() {
        this.context = this.model.getContext(this.input);

        this.form    = this.formBuilder.group({
            basicInputSection: {value: this.input, disabled: this.readonly},
            description: {value: this.input, disabled: this.readonly},
            stageInputSection: this.input
        });

        this.tracked = this.form.valueChanges.subscribe(() => {
            this.save.next(this.input);
        });
    }
}
