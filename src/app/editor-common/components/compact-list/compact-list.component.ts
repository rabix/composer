import {Component, Input, ElementRef, Renderer, ViewChild, forwardRef} from "@angular/core";
import {FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS} from "@angular/forms";
import {EditableDirective} from "../../directives/editable.directive";

require("./compact-list.component.scss");

@Component({
    selector: "compact-list",
    directives: [
        EditableDirective
    ],
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CompactListComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => CompactListComponent), multi: true }
    ],
    template: `
            <div class="compact-list-wrapper" (click)="onListWrapperClick()">
                
                <div class="input-tag-list">
                    
                    <span *ngFor="let tag of tagList; let i = index;"
                          class="tag tag-pill tag-default">
                          {{tag}}
                          <i class="fa fa-times remove-tag-icon" 
                             (click)="removeTag(i, $event)"></i>
                    </span>
                   
                   
                    <!-- Not using the <input>, 
                         so that the width can adjust to the text length,
                         and break into a new line if its long -->
                    <span #tagInput ct-editable contenteditable="true"
                          class="tag-input"
                          *ngIf="tagInputControl"
                          [ngClass]="{'invalid-input': !isValidInput }"
                          [formControl]="tagInputControl"
                          (keydown)="onTagInputKeyDown($event)"
                          (keyup)="onTagInputKeyUp()"
                          (blur)="onTagInputBlur()">
                    </span>
                     
                      <span *ngIf="isValidInput === false" 
                            class="tooltip-wrapper">
                          <i class="fa fa-exclamation-circle input-error-icon"></i>
                          
                          <span class="tooltip-text">
                            {{validationMessage}}
                          </span>
                      </span>
                </div>
            </div>
    `
})
export class CompactListComponent implements ControlValueAccessor  {

    /**
     * Key codes
     * Tab: 9
     * Enter: 13
     * Space: 32
     * */
    @Input()
    public addKeyCode: number = 9;

    @ViewChild("tagInput")
    private tagInputElement: ElementRef;

    /** The form control for the input */
    public control: FormControl;

    public tagList: any[] = [];

    /** Last value of the input validity */
    private isValidInput = true;

    /** FormControl for the tag input field */
    private tagInputControl: FormControl;

    private validationMessage: string = "Input not valid.";

    private onTouched = () => { };

    private propagateChange = (_) => {};

    constructor(private renderer: Renderer) {
        this.tagInputControl = new FormControl("");
    }

    private writeValue(value: any[]): void {
        this.tagList = value.slice();
    }

    private registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    private registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    private onListWrapperClick(): void {
        this.renderer.invokeElementMethod(this.tagInputElement.nativeElement, 'focus', []);
    }

    private validate(c: FormControl): void {
        this.control = c;
    }

    private onTagInputKeyDown(event): void {
        const tabKeyCode = 9;
        const backspaceCode = 8;

        const tagInputValue: string = this.tagInputControl.value;
        const trimmedValue: string = tagInputValue.trim();

        const newControlList: string[] = [...this.tagList, trimmedValue];

        if (tagInputValue.length === 0 && event.keyCode === backspaceCode) {
            this.removeTag(this.tagList.length - 1);
            return;
        }

        //make sure value was not a sequence of white spaces
        if (event.keyCode === this.addKeyCode && !!trimmedValue) {
            if (this.addKeyCode === tabKeyCode) {
                event.preventDefault();
            }

            this.addTagInControl(trimmedValue);
            this.isValidInput = this.control.valid;

            if (!!this.isValidInput) {
                this.tagList.push(trimmedValue);
                this.tagInputControl.setValue("");
            } else {
                //TODO: this will always return a string array
                this.propagateChange(newControlList.slice(0, -1));
            }
        }
    }

    private onTagInputKeyUp(): void {
        const tagInputValue: string = this.tagInputControl.value;

        if (tagInputValue.length === 0) {
            this.isValidInput = true;
        }
    }

    private onTagInputBlur(): void {
        this.tagInputControl.setValue("");
        this.isValidInput = true;
    }

    private addTagInControl(tag: string): void {
        this.propagateChange([...this.tagList, tag]);
    }

    private removeTag(index: number, event?: Event): void {
        if (!!event) {
            event.stopPropagation();
        }

        this.tagList.splice(index, 1);
        this.propagateChange(this.tagList);
    }
}
