import {ChangeDetectorRef, Component, forwardRef, Inject, Input} from "@angular/core";
import {ControlValueAccessor, FormArray, FormControl, NG_VALUE_ACCESSOR} from "@angular/forms";
import {CommandLineToolModel, ExpressionModel} from "cwlts/models";
import {ErrorCode} from "cwlts/models/helpers/validation";
import {APP_MODEL} from "../../../core/factories/app-model-provider-factory";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
    selector: "ct-base-command-editor",
    styleUrls: ["./base-command-editor.component.scss"],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => BaseCommandEditorComponent),
        multi: true
    }],
    template: `
        <ct-blank-state *ngIf="formControl.enabled && formControl.length === 0" (buttonClick)="addEntry()"
                        [hasAction]="true">
            <section tc-button-text>Add base command</section>
            <section tc-description>
                The part of the command that comes before any tool parameters or options. You can also
                include parameters or options
                that you want to be fixed for every execution of the tool (provided they can be placed
                before any variable
                parameters and options in the command line), or these can be set as arguments below.
            </section>
        </ct-blank-state>

        <div *ngIf="formControl.length === 0" class="text-xs-center">
            This tool doesn't specify a base command
        </div>

        <ol *ngIf="formControl.length > 0" class="list-unstyled">
            <li *ngFor="let control of formControl.controls; let i = index" class="removable-form-control">


                <ct-expression-input *ngIf="allowExpressions; else stringInput" [formControl]="control"
                                     [readonly]="readonly"
                                     [context]="appModel.getContext()"></ct-expression-input>

                <ng-template #stringInput>
                    <input class="form-control" data-test="base-command-string" [formControl]="control" [readonly]="readonly"/>
                </ng-template>

                <div *ngIf="formControl.enabled && !readonly" class="remove-icon">
                    <i ct-tooltip="Delete" class="fa fa-trash clickable" data-test="remove-base-command-button" (click)="removeEntry(i)"></i>
                </div>

            </li>
        </ol>

        <button *ngIf="!readonly && formControl.enabled && formControl.length > 0" type="button"
                class="btn btn-link add-btn-link no-underline-hover"
                (click)="addEntry()">
            <i class="fa fa-plus"></i> Add base command
        </button>
    `,
})
export class BaseCommandEditorComponent extends DirectiveBase implements ControlValueAccessor {

    @Input()
    allowExpressions = false;

    @Input()
    readonly = false;

    formControl: FormArray;

    private propagateChange = (commands: Array<string | ExpressionModel>) => void 0;

    private propagateTouch = () => void 0;

    constructor(@Inject(APP_MODEL) private appModel: CommandLineToolModel,
                private modal: ModalService,
                private cdr: ChangeDetectorRef) {
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

    setDisabledState(isDisabled: boolean): void {
        isDisabled ? this.formControl.disable({emitEvent: false}) : this.formControl.enable({emitEvent: false});
    }

    addEntry(): void {
        // CMD will be undefined if this is a v1.0 app, adding returns only for draft-2
        // we need to cast it to a value in order to avoid runtime issues
        // FIXME: make this uniform in cwlts
        const cmd  = this.appModel.addBaseCommand() || "";
        this.formControl.push(new FormControl(cmd));
    }

    removeEntry(index: number): void {
        this.modal.delete("base command").then(() => {

            // Reset the expression's validity
            // @TODO: if this is an ExpressionModel, model won't revalidate when an entry is removed
            const entryAtIndex = this.formControl.at(index).value;

            if (entryAtIndex instanceof ExpressionModel) {
                entryAtIndex.clearIssue(ErrorCode.EXPR_ALL);
            }

            this.formControl.removeAt(index);
            this.cdr.markForCheck();
        }, err => {
            console.warn(err);
        });
    }

}
