import {ChangeDetectorRef, Component,  forwardRef, Input} from "@angular/core";
import {ControlValueAccessor, FormArray, FormControl, NG_VALUE_ACCESSOR} from "@angular/forms";
import {CommandInputParameterModel, CommandOutputParameterModel, ExpressionModel} from "cwlts/models";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {ErrorCode} from "cwlts/models/helpers/validation";

@Component({
    styleUrls: ["./secondary-files.component.scss"],
    selector: "ct-secondary-file",
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => SecondaryFilesComponent),
        multi: true
    }],
    template: `
        <ct-form-panel class="borderless" [collapsed]="true">
            <div class="tc-header">Secondary Files</div>
            <div class="tc-body">
                    <ct-blank-state *ngIf="formControl.enabled && formControl.length === 0"
                                    [hasAction]="true"                                   
                                    (buttonClick)="addFile()">
                        <section tc-button-text>Add secondary file</section>
                    </ct-blank-state>

                    <div *ngIf="formControl.length === 0" class="text-xs-center">
                        No Secondary Files defined.
                    </div>

                    <ol *ngIf="formControl.length > 0" class="list-unstyled">

                        <li *ngFor="let control of formControl.controls; let i = index"
                            class="removable-form-control">

                            <ct-expression-input
                                    data-test="secondary-file"
                                    [context]="context"
                                    [formControl]="control"
                                    [readonly]="readonly">
                            </ct-expression-input>

                            <div *ngIf="formControl.enabled && !readonly" class="remove-icon"
                                 [ct-tooltip]="'Delete'"
                                 (click)="removeFile(i)">
                                <i class="fa fa-trash clickable" data-test="remove-secondary-file"></i>
                            </div>
                        </li>
                    </ol>

                    <button type="button" 
                            data-test="add-secondary-file-button"
                            *ngIf="!readonly && formControl.enabled && formControl.length > 0"
                            class="btn btn-link add-btn-link no-underline-hover"
                            (click)="addFile()">
                        <i class="fa fa-plus"></i> Add secondary file
                    </button>
            </div>
        </ct-form-panel>
    `
})

export class SecondaryFilesComponent extends DirectiveBase implements ControlValueAccessor {

    @Input()
    public readonly = false;

    /** Context in which expression should be evaluated */
    @Input()
    public context: { $job: any } = {$job: {}};

    @Input()
    port: CommandInputParameterModel | CommandOutputParameterModel;

    @Input()
    bindingName: string;

    formControl: FormArray;

    private propagateChange = (commands: Array<ExpressionModel>) => void 0;

    private propagateTouch = () => void 0;

    constructor(private modal: ModalService, private cdr: ChangeDetectorRef) {
        super();
    }

    writeValue(expressions: ExpressionModel[]): void {
        if (!expressions) {
            return;
        }

        const arrayControls = expressions.map(expr => new FormControl(expr));

        this.formControl = new FormArray(arrayControls);

        this.formControl.valueChanges.subscribeTracked(this, v => {
            this.propagateChange(this.formControl.value || []);
        });
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.propagateTouch = fn;
    }

    removeFile(index: number) {
        this.modal.delete("secondary file").then(() => {
            // Reset the expression's validity
            const entryAtIndex = this.formControl.at(index).value;

            if (entryAtIndex) {
                entryAtIndex.clearIssue(ErrorCode.EXPR_ALL);
            }

            this.formControl.removeAt(index);
            this.cdr.markForCheck();
        }, err => {
            console.warn(err);
        });
    }

    addFile() {
        const cmd = this.port.addSecondaryFile(null);
        this.formControl.push(new FormControl(cmd));
    }

    setDisabledState(isDisabled: boolean): void {
        isDisabled ? this.formControl.disable({emitEvent: false}) : this.formControl.enable({emitEvent: false});
    }
}
