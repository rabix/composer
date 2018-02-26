import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, Renderer, ViewChild, ViewEncapsulation} from "@angular/core";
import {FormControl} from "@angular/forms";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-input",
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ["./input.component.scss"],
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
                       [formControl]="control"
                       [disabled]="readonly"/>
            </div>
        </label>
    `

})
export class InputComponent implements AfterViewInit {

    @Input()
    control: FormControl;

    @Input()
    placeholder: string;

    @Input()
    autofocus: boolean;

    @Input()
    name: string;

    @Input()
    readonly = false;

    @ViewChild("inputField")
    inputField: ElementRef;

    constructor(private renderer: Renderer) {
        this.name = "";
        this.placeholder = "";
        this.autofocus = false;
    }

    ngAfterViewInit() {
        if (this.autofocus) {
            // https://github.com/angular/angular/issues/15008#issuecomment-285141070
            this.inputField.nativeElement.focus();
        }
    }
}
