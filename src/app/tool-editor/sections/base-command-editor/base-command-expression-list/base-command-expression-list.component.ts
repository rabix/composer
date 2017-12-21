import {ChangeDetectionStrategy, Component, forwardRef, OnInit} from "@angular/core";
import {ControlValueAccessor, FormArray, NG_VALUE_ACCESSOR} from "@angular/forms";

@Component({
    selector: "ct-base-command-expression-list",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => BaseCommandExpressionListComponent),
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

        <div *ngIf="formList.enabled && formList.length === 0" class="text-xs-center">
            This tool doesn't specify a base command
        </div>

        <ol *ngIf="formList.length > 0" class="list-unstyled">
            <li *ngFor="let control of formList.controls; let i = index" class="removable-form-control">

                <ct-expression-input [formControl]="control"></ct-expression-input>

                <div *ngIf="formList.enabled" class="remove-icon">
                    <i ct-tooltip="Delete" class="fa fa-trash clickable" (click)="formList.removeAt(i)"></i>
                </div>

            </li>
        </ol>

        <button *ngIf="formList.enabled && formList.length > 0" type="button" class="btn btn-link add-btn-link no-underline-hover"
                (click)="addEntry()">
            <i class="fa fa-plus"> Add base command</i>
        </button>
    `,
    styleUrls: ["./base-command-expression-list.component.scss"],

})
export class BaseCommandExpressionListComponent implements OnInit, ControlValueAccessor {

    formList: FormArray;

    constructor() {
    }

    ngOnInit() {

        this.formList = new FormArray([]);
    }

    writeValue(obj: any): void {
        let writeVal = [];
        if (Array.isArray(obj)) {
            writeVal = obj;
        }
    }

    registerOnChange(fn: any): void {
    }

    registerOnTouched(fn: any): void {
    }

    setDisabledState(isDisabled: boolean): void {
        isDisabled ? this.formList.disable() : this.formList.enable();
    }

    addEntry(): void {

    }
}
