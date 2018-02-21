import {
    AfterViewInit,
    Component,
    EventEmitter,
    forwardRef,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges
} from "@angular/core";
import {ControlValueAccessor, FormArray, FormControl, FormGroup, NG_VALUE_ACCESSOR} from "@angular/forms";
import {CommandLineToolModel, RequirementBaseModel, StepModel, WorkflowModel} from "cwlts/models";
import {Subscription} from "rxjs/Subscription";
import {SystemService} from "../../../platform-providers/system.service";
import {ModalService} from "../../../ui/modal/modal.service";
import {ErrorCode} from "cwlts/models/helpers/validation";
import {V1ExpressionModel} from "cwlts/models/v1.0";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {SBDraft2ExpressionModel} from "cwlts/models/d2sb";

@Component({
    selector: "ct-hint-list",
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => HintsComponent),
        multi: true
    }],
    template: `
        <!--Blank Tool Screen-->
        <ct-blank-state *ngIf="!readonly && !formControl.length" (buttonClick)="addEntry()"
                        [learnMoreURL]="'http://docs.sevenbridges.com/docs/list-of-execution-hints'"
                        [hasAction]="true">
            <section tc-button-text>Add a Hint</section>
            <section tc-description>
                Set execution hints and their values, which specify the requirements and preferences for execution.
                For instance, use hints to specify the type of AWS instance to execute your task.
            </section>
        </ct-blank-state>

        <div *ngIf="!formControl.enabled && formControl.length === 0" class="text-xs-center">
            No hints are specified for this tool
        </div>

        <!--List Header Row-->
        <div class="editor-list-title" *ngIf="formControl.length > 0">
            <div class="col-xs-6">
                Class
            </div>
            <div class="col-xs-6">
                Value
            </div>
        </div>

        <form [formGroup]="form" *ngIf="form">
            <ul class="editor-list" formArrayName="hints">
                <li *ngFor="let control of form.controls['hints'].controls; let i = index">
                    <div class="flex-row">
                        <ct-requirement-input [formControl]="control"
                                              [context]="context"
                                              [formControlName]="i"
                                              [classSuggest]="classSuggest"
                                              [readonly]="readonly">
                        </ct-requirement-input>

                        <!--Actions Column-->
                        <div *ngIf="!readonly" class="remove-icon">
                            <i [ct-tooltip]="'Delete'"
                               data-test="remove-hint-button"
                               class="fa fa-trash clickable"
                               (click)="removeEntry(i)"></i>
                        </div>
                    </div>
                </li>
            </ul>
        </form>

        <!--Add entry link-->
        <button *ngIf="!readonly && !!formControl.length"
                (click)="addEntry()"
                type="button"
                class="btn pl-0 btn-link no-outline no-underline-hover"
                data-test="tool-add-hint-button-small">
            <i class="fa fa-plus"></i> Add a Hint
        </button>

    `,
    styleUrls: ["./hint-list.component.scss"]
})
export class HintsComponent extends DirectiveBase implements ControlValueAccessor {

    @Input()
    classSuggest: string[];

    @Input()
    cwlVersion: string;

    @Input()
    readonly = false;

    @Input()
    context: any;

    @Input()
    disabled = false;

    form: FormGroup;

    formControl: FormArray;

    private propagateChange = (hint: RequirementBaseModel) => void 0;

    private propagateTouch = () => void 0;

    private sub: Subscription;

    constructor(private modal: ModalService, public system: SystemService) {
        super();
    }

    writeValue(hints: RequirementBaseModel[]) {
        if (!hints) {
            return;
        }

        const arrayControls = hints.map(hint => new FormControl(hint));

        this.formControl = new FormArray(arrayControls);

        this.form = new FormGroup({hints: this.formControl});

        this.formControl.valueChanges.subscribeTracked(this, (value) => {
            this.propagateChange(this.formControl.value || {});
        });
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.propagateTouch = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        isDisabled ? this.formControl.disable({emitEvent: false}) : this.formControl.enable({emitEvent: false});
    }

    addEntry() {
        const hint = { class: "", value: this.cwlVersion === "v1.0" ? new V1ExpressionModel("") : new SBDraft2ExpressionModel("") };

        this.formControl.push(new FormControl({
            value: hint,
            disabled: this.readonly
        }));
    }

    removeEntry(i: number) {
        const hints = this.formControl.value;

        this.modal.delete("hint").then(() => {
            hints.splice(i, 1);
            this.formControl.removeAt(i);
        }, err => {
            console.warn(err);
        });
    }
}
