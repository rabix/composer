import {ChangeDetectionStrategy, Component, forwardRef, Input, OnInit} from "@angular/core";
import {ControlValueAccessor, FormArray, FormControl, NG_VALUE_ACCESSOR} from "@angular/forms";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
    selector: "ct-base-command-editor",
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ["./base-command-editor.component.scss"],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => BaseCommandEditorComponent),
        multi: true
    }],
    template: `
        <ct-blank-state *ngIf="formList.enabled && formList.length === 0" (buttonClick)="addEntry()" [hasAction]="true">
            <section tc-button-text>Add base command</section>
            <section tc-description>
                The part of the command that comes before any tool parameters or options. You can also
                include parameters or options
                that you want to be fixed for every execution of the tool (provided they can be placed
                before any variable
                parameters and options in the command line), or these can be set as arguments below.
            </section>
        </ct-blank-state>

        <div *ngIf="formList.length === 0" class="text-xs-center">
            This tool doesn't specify a base command
        </div>

        <ol *ngIf="formList.length > 0" class="list-unstyled">
            <li *ngFor="let control of formList.controls; let i = index" class="removable-form-control">


                <ct-expression-input *ngIf="allowExpressions; else stringInput" [formControl]="control"></ct-expression-input>
                <ng-template #stringInput>
                    <input class="form-control" data-test="base-command-string" [formControl]="control"/>
                </ng-template>

                <div *ngIf="formList.enabled" class="remove-icon">
                    <i ct-tooltip="Delete" class="fa fa-trash clickable" (click)="formList.removeAt(i)"></i>
                </div>

            </li>
        </ol>

        <button *ngIf="formList.enabled && formList.length > 0" type="button" class="btn btn-link add-btn-link no-underline-hover"
                (click)="addEntry()">
            <i class="fa fa-plus"></i> Add base command
        </button>
    `,
})
export class BaseCommandEditorComponent extends DirectiveBase implements OnInit, ControlValueAccessor {

    @Input()
    allowExpressions = false;

    formList: FormArray;

    private propagateChange = () => void 0;

    private propagateTouch = () => void 0;

    ngOnInit() {
        this.formList = new FormArray([]);
        this.formList.valueChanges.subscribeTracked(this, values => {
            console.log("Base ommand value changes", values);
        });
    }

    writeValue(obj: any): void {

    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.propagateTouch = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        isDisabled ? this.formList.disable() : this.formList.enable();
    }

    addEntry() {
        this.formList.push(new FormControl());
    }

}
