import {Component, Input, OnInit} from "@angular/core";
import {FormBuilder, ControlGroup} from "@angular/common";
import {Validators, REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES} from "@angular/forms";

require("./form.components.scss");

@Component({
    selector: 'docker-input-form',
    directives: [
        REACTIVE_FORM_DIRECTIVES,
        FORM_DIRECTIVES
    ],
    template: `
            <form [formGroup]="dockerInputForm">
                <fieldset class="form-group">
                      <button type="button" class="btn btn-secondary hide-btn">Hide</button>
               
                        <label>Docker image</label>
                        <label class="secondary-label">Docker Repository</label>
                        
                       <input name="dockerPull"
                            type="text"
                            class="form-control"
                            id="dockerImage"
                            [formControl]="dockerInputForm.controls['dockerInput']"
                            [(ngModel)]="dockerPull">
                </fieldset>
            </form>
    `
})
export class DockerInputFormComponent implements OnInit {
    @Input()
    private dockerPull: string;

    /** The parent forms control group */
    @Input()
    private control: ControlGroup;

    private dockerInputForm: ControlGroup;

    constructor(private formBuilder: FormBuilder) {
        this.dockerInputForm = this.formBuilder.group({
            dockerInput: ['', Validators.compose([Validators.required, Validators.minLength(1)])]
        });
    }

    ngOnInit(): void {
        this.control.addControl('dockerInput', this.dockerInputForm.controls['dockerInput']);
    }
}
