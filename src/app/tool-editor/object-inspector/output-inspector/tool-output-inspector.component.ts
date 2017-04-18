import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    ViewEncapsulation
} from "@angular/core";
import {CommandInputParameterModel, CommandOutputParameterModel} from "cwlts/models";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-tool-output-inspector",
    template: `
        <form [formGroup]="form" (ngSubmit)="onSubmit(form)">

            <ct-basic-output-section [formControl]="form.controls['basicOutputSection']"
                                     [readonly]="readonly"
                                     [context]="context">
            </ct-basic-output-section>

            <ct-output-metadata-section [inputs]="inputList"
                                        *ngIf="form.controls['metaData']"
                                        [formControl]="form.controls['metaData']"
                                        [readonly]="readonly">
            </ct-output-metadata-section>

            <ct-output-eval [formControl]="form.controls['outputEval']"
                            [readonly]="readonly">
            </ct-output-eval>

            <ct-secondary-file *ngIf="isFileType() && form.controls['secondaryFiles']"
                               [formControl]="form.controls['secondaryFiles']"
                               [readonly]="readonly">
            </ct-secondary-file>

            <ct-description-section [formControl]="form.controls['description']"
                                    [readonly]="readonly">
            </ct-description-section>

        </form>
    `
})
export class ToolOutputInspector extends DirectiveBase implements OnChanges {

    @Input()
    public readonly = false;

    @Input()
    public inputs: CommandInputParameterModel[] = [];

    @Input()
    public output: CommandOutputParameterModel;

    /** Context in which expression should be evaluated */
    @Input()
    public context: { $job?: any, $self?: any } = {};

    public inputList: CommandInputParameterModel[] = [];

    public form: FormGroup;

    @Output()
    public save = new EventEmitter<CommandOutputParameterModel>();

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    ngOnChanges(changes: SimpleChanges): void {
        const items = ["File", "record"];

        this.inputList = changes["inputs"].currentValue.filter(entry =>
            (items.indexOf(entry.type.type) > -1 ||
            (entry.type.type === "array" && items.indexOf(entry.type.items) > -1)));
    }

    ngOnInit() {
        this.form = this.formBuilder.group({
            basicOutputSection: [this.output],
            description: [this.output],
            outputEval: [this.output]
        });

        if (this.output.outputBinding.hasMetadata && this.output.outputBinding.hasInheritMetadata) {
            this.form.addControl("metaData", new FormControl(this.output));
        }

        if (this.output.outputBinding.hasSecondaryFiles) {
            this.form.addControl("secondaryFiles", new FormControl(this.output.outputBinding.secondaryFiles || []));
        } else if (this.output.hasSecondaryFiles) {
            this.form.addControl("secondaryFiles", new FormControl(this.output.secondaryFiles || []));
        }

        this.tracked = this.form.valueChanges.subscribe(value => {
            if (value.secondaryFiles && this.output.outputBinding.hasSecondaryFiles) {
                this.output.outputBinding.secondaryFiles = value.secondaryFiles;
            } else if (value.secondaryFiles && this.output.hasSecondaryFiles) {
                this.output.secondaryFiles = value.secondaryFiles;
            }

            this.save.next(this.output);
        });
    }

    onSubmit(form: FormGroup) {
        this.save.next(form.value);
    }

    isFileType() {
        return this.output.type.type === "File" || (this.output.type.type === "array" && this.output.type.items === "File");
    }
}
