import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    ViewEncapsulation,
    OnInit
} from "@angular/core";
import {
    WorkflowInputParameterModel,
    WorkflowModel,
    WorkflowOutputParameterModel
} from "cwlts/models";
import {FormBuilder, FormGroup} from "@angular/forms";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {Workflow} from "cwl-svg";

@Component({
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "ct-workflow-io-inspector",
    styleUrls: ["./workflow-io-inspector.components.scss"],
    template: `
        <!--Required-->
        <div *ngIf="isInputPort()" class="form-group flex-container">
            <label>Required</label>
            <span class="align-right">
                        <ct-toggle-slider [formControl]="form.controls['isRequired']"
                                          [off]="'No'"
                                          [on]="'Yes'"
                                          [readonly]="readonly">
                        </ct-toggle-slider>
                    </span>
        </div>

        <!--ID-->
        <div class="form-group" [class.has-danger]="form.controls['id'].errors">
            <label class="form-control-label">ID</label>
            <input type="text"
                   class="form-control"
                   [formControl]="form.controls['id']">
            <div *ngIf="form.controls['id'].errors" class="form-control-feedback">
                {{form.controls['id'].errors['error']}}
            </div>
        </div>

        <!--Connections-->
        <div *ngIf="!isInputPort()">

            <!--No connections-->
            <div *ngIf="port['source'].length === 0">
                <span class="text-warning small">
                    <i class="fa fa-warning fa-fw"></i> This port is not connected
                </span>
            </div>

            <!--List of connections-->
            <div *ngIf="port['source'].length > 0" class="text-muted small">
                Connections: {{ port['source'].join(", ") }}
            </div>
        </div>

        <!--Label-->
        <div class="form-group">
            <label class="form-control-label">Label</label>
            <input type="text"
                   class="form-control"
                   [formControl]="form.controls['label']">
        </div>

        <!--Input Type -->
        <ct-input-type-select [formControl]="form.controls['typeForm']"
                              [propertyTypes]="propertyTypes"
                              [itemTypes]="itemTypes"></ct-input-type-select>

        <!--Symbols-->
        <ct-symbols-section class="form-group"
                            *ngIf="isEnumType()"
                            [formControl]="form.controls['symbols']"
                            [readonly]="readonly">
        </ct-symbols-section>

        <!--File Types-->
        <div *ngIf="isFileType() && isInputPort()">
            <label class="form-control-label">File types</label>
            <input class="form-control"
                   [formControl]="form.controls['fileTypes']"/>
        </div>

        <!--Description-->
        <div class="form-group">
            <label class="form-control-label">Description</label>
            <textarea class="form-control"
                      rows="4"
                      [formControl]="form.controls['description']"></textarea>
        </div>

    `

})
export class WorkflowIOInspectorComponent extends DirectiveBase implements OnInit {

    public propertyTypes = ["array", "enum", "File", "string", "int", "float", "boolean"];

    public itemTypes = ["File", "string", "int", "float", "boolean"];

    @Input()
    public port: WorkflowInputParameterModel | WorkflowOutputParameterModel;

    @Input()
    public workflowModel: WorkflowModel;

    @Input()
    public readonly = false;

    @Input()
    public graph: Workflow;

    form: FormGroup;

    private initSymbolsList: string[] = [];

    constructor(private formBuilder: FormBuilder, private cdr: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {

        this.form = this.formBuilder.group({
            isRequired: [!this.port.type.isNullable],
            id: [{value: this.port.id, disabled: this.readonly}],
            label: [{value: this.port.label, disabled: this.readonly}],
            typeForm: [{value: this.port.type, disabled: this.readonly}],
            symbols: [this.port.type.symbols ? this.port.type.symbols : this.initSymbolsList],
            description: [{value: this.port.description, disabled: this.readonly}],
            fileTypes: [{value: this.port.customProps["sbg:fileTypes"], disabled: this.readonly}]
        });

        this.tracked = this.form.controls["isRequired"].valueChanges.subscribe((value) => {
            this.port.type.isNullable = !value;
        });

        this.tracked = this.form.controls["id"].valueChanges.debounceTime(200).subscribe((value) => {
            try {
                // Change id on workflow model so canvas can interact with it
                this.workflowModel.changeIONodeId(this.port, value);
                this.graph.redraw();

                if (this.isEnumType()) {
                    this.port.type.name = value;
                }
            } catch (e) {
                this.form.controls["id"].setErrors({error: e.message});
                // Because this comes outside of Angular (workflow model)
                this.cdr.markForCheck();
            }
        });

        this.tracked = this.form.controls["symbols"].valueChanges.subscribe((value) => {
            if (value.length > 0 && this.isEnumType()) {
                this.port.type.symbols = value;
            }
        });

        this.tracked = this.form.controls["fileTypes"].valueChanges.subscribe((value) => {
            if (value) {
                this.port.customProps["sbg:fileTypes"] = value;
            } else {
                delete this.port.customProps["sbg:fileTypes"];
            };
        });

        this.tracked = this.form.controls["label"].valueChanges.subscribe((label) => {
            this.port.label = label;
            this.graph.redraw();
        });

        this.tracked = this.form.controls["description"].valueChanges.subscribe((description) => {
            this.port.description = description;
        });

    }

    isInputPort() {
        return this.port instanceof WorkflowInputParameterModel;
    }

    isEnumType() {
        return this.port.type.type === "enum" || (this.port.type.type === "array" && this.port.type.items === "enum");
    }

    isFileType() {
        return this.port.type.type === "File" || (this.port.type.type === "array" && this.port.type.items === "File");
    }
}
