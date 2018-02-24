import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation} from "@angular/core";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {CommandInputParameterModel, CommandLineToolModel, CommandOutputParameterModel} from "cwlts/models";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-tool-output-inspector",
    template: `
        <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <ct-basic-output-section [formControl]="form.controls['basicOutputSection']"
                                     [model]="model">
            </ct-basic-output-section>

            <ct-output-metadata-section [inputs]="inputList"
                                        *ngIf="form.controls['metaData']"
                                        [formControl]="form.controls['metaData']">
            </ct-output-metadata-section>

            <ct-output-eval [formControl]="form.controls['outputEval']"
                            [model]="model">
            </ct-output-eval>

            <ct-secondary-file *ngIf="showSecondaryFiles()"
                               [formControl]="form.controls['secondaryFiles']"
                               [context]="context"
                               [port]="output"
                               [readonly]="readonly"
                               [bindingName]="'outputBinding'"
                               (update)="save.next(output)">
            </ct-secondary-file>

            <ct-description-section [formControl]="form.controls['description']">
            </ct-description-section>

        </form>
    `
})
export class ToolOutputInspectorComponent extends DirectiveBase implements OnChanges, OnInit {

    disabled = false;

    get readonly(): boolean {
        return this.disabled;
    }

    @Input("readonly")
    set readonly(value: boolean) {
        this.disabled = value;
        if (this.form) {
            Object.keys(this.form.controls).forEach((item) => {
                const control = this.form.controls[item];
                this.disabled ? control.disable({onlySelf: true, emitEvent: false})
                    : control.enable({onlySelf: true, emitEvent: false});
            });
        }
    }

    @Input()
    inputs: CommandInputParameterModel[] = [];

    @Input()
    output: CommandOutputParameterModel;

    /** Context in which expression should be evaluated */
    @Input()
    context: any = {};

    @Input()
    model: CommandLineToolModel;

    inputList: CommandInputParameterModel[] = [];

    form: FormGroup;

    @Output()
    save = new EventEmitter<CommandOutputParameterModel>();

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    ngOnChanges(changes: SimpleChanges): void {
        const items = ["File", "record"];

        if (changes["inputs"]) {
            this.inputList = changes["inputs"].currentValue.filter(entry =>
                (items.indexOf(entry.type.type) > -1 ||
                (entry.type.type === "array" && items.indexOf(entry.type.items) > -1)));
        }
    }

    ngOnInit() {
        this.form = this.formBuilder.group({
            basicOutputSection: [{value: this.output, disabled: this.readonly}],
            description: [{value: this.output, disabled: this.readonly}],
            outputEval: [{value: this.output, disabled: this.readonly}],
            secondaryFiles: [{value: this.output.secondaryFiles, disabled: this.readonly}]
        });

        if (this.output.outputBinding.hasMetadata || this.output.outputBinding.hasInheritMetadata) {
            this.form.addControl("metaData", new FormControl({value: this.output, disabled: this.readonly}));
        }

        this.tracked = this.form.valueChanges.subscribe(() => {
            this.save.next(this.output);
        });
    }

    showSecondaryFiles(): boolean {
        const isFile      = this.output.type.type === "File" || (this.output.type.type === "array" && this.output.type.items === "File");
        const hasSecFiles = this.output.hasSecondaryFilesInRoot || !!this.output.outputBinding;
        return isFile && hasSecFiles;
    }

    onSubmit() {
        this.save.next(this.output);
    }
}
