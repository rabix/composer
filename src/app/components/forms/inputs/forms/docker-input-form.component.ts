import {Component, Input, OnInit} from "@angular/core";
import {
    Validators,
    FormBuilder,
    FormGroup,
    REACTIVE_FORM_DIRECTIVES,
    FORM_DIRECTIVES
} from "@angular/forms";
import {CommandLineToolModel} from "cwlts/models/d2sb";
import {FormSectionComponent} from "../../../form-section/form-section.component";

@Component({
    selector: 'docker-input-form',
    directives: [
        REACTIVE_FORM_DIRECTIVES,
        FORM_DIRECTIVES,
        FormSectionComponent
    ],
    template: `
<ct-form-section>
    <fs-header>
        Docker Image
    </fs-header>

    <fs-body>
        <form [formGroup]="dockerInputForm">

            <label for="docker_image" class="form-control-label">Docker Repository</label>
            <input name="dockerPull"
                   type="text"
                   class="form-control"
                   id="docker_image"
                   [formControl]="dockerInputForm.controls['dockerInput']"
                   [(ngModel)]="dockerPull">
        </form>
    </fs-body>
</ct-form-section>
            
    `
})
export class DockerInputFormComponent implements OnInit {
    @Input()
    public dockerPull: string;

    @Input()
    public cltModel: CommandLineToolModel;

    /** The parent forms control group */
    @Input()
    public group: FormGroup;

    private dockerInputForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.dockerInputForm = this.formBuilder.group({
            dockerInput: ['', Validators.compose([Validators.required, Validators.minLength(1)])]
        });
    }

    ngOnInit(): void {
        this.group.addControl('dockerInput', this.dockerInputForm.controls['dockerInput']);
    }
}
