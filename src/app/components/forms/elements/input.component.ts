import {Component, Input, ElementRef, ViewChild, Renderer, AfterViewInit, ChangeDetectionStrategy} from "@angular/core";
import {FormControl, FORM_DIRECTIVES, REACTIVE_FORM_DIRECTIVES} from "@angular/forms";
require("./input.component.scss");

@Component({
    selector: "ct-input",
    directives: [FORM_DIRECTIVES, REACTIVE_FORM_DIRECTIVES],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        "class": "form-group"
    },
    template: `
        <label class="label-block form-control-label">
            <div class="label-text">{{ name }}</div>
            <div>
                <input #inputField
                       class="form-control input-sm"
                       [placeholder]="placeholder"
                       [formControl]="control"/>
            </div>
        </label>
    `

})
export class InputComponent implements AfterViewInit {

    @Input()
    private control: FormControl;

    @Input()
    private placeholder: string;

    @Input()
    private autofocus: boolean;

    @Input()
    private name: string;

    @ViewChild("inputField")
    private inputField: ElementRef;

    constructor(private renderer: Renderer) {
        this.name = "";
        this.placeholder = "";
        this.autofocus = false;
    }

    ngAfterViewInit() {
        if (this.autofocus) {
            this.renderer.invokeElementMethod(this.inputField.nativeElement, "focus");
        }
    }
}
