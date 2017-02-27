import {Component, Input, OnChanges, Output, SimpleChanges, ViewEncapsulation} from "@angular/core";
import {CommandOutputParameterModel, SBDraft2CommandInputParameterModel} from "cwlts/models/d2sb";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Subject} from "rxjs";
import {ComponentBase} from "../../../components/common/component-base";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-tool-output-inspector",
    template: `
        <form [formGroup]="form" (ngSubmit)="onSubmit(form)">

            <ct-basic-output-section [formControl]="form.controls['basicOutputSection']"
                                     [readonly]="readonly"
                                     [context]="context">
            </ct-basic-output-section>

            <ct-description-section [formControl]="form.controls['description']"
                                    [readonly]="readonly">
            </ct-description-section>

            <ct-output-metadata-section [inputs]="inputList"
                                        [formControl]="form.controls['metaData']"
                                        [readonly]="readonly">
            </ct-output-metadata-section>

            <ct-output-eval [formControl]="form.controls['outputEval']"
                            [readonly]="readonly">
            </ct-output-eval>

            <ct-secondary-file *ngIf="isFileType()"
                               [formControl]="form.controls['secondaryFiles']"
                               [readonly]="readonly">
            </ct-secondary-file>

        </form>
    `
})
export class ToolOutputInspector extends ComponentBase implements OnChanges {

    @Input()
    public readonly = false;

    @Input()
    public inputs: SBDraft2CommandInputParameterModel[] = [];

    @Input()
    public output: CommandOutputParameterModel;

    /** Context in which expression should be evaluated */
    @Input()
    public context: { $job?: any, $self?: any } = {};

    private inputList: SBDraft2CommandInputParameterModel[] = [];

    private form: FormGroup;

    @Output()
    public save = new Subject<CommandOutputParameterModel>();

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
            outputEval: [this.output],
            metaData: [this.output],
            secondaryFiles: [this.output.outputBinding.secondaryFiles || []]
        });

        this.tracked = this.form.valueChanges.subscribe(value => {
            this.output.outputBinding.secondaryFiles = value.secondaryFiles;

            this.save.next(this.output);
        });
    }

    private onSubmit(form: FormGroup) {
        this.save.next(form.value);
    }

    private isFileType() {
        return this.output.type.type === "File" || (this.output.type.type === "array" && this.output.type.items === "File");
    }
}
