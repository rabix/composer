import {Component, Input} from "@angular/core";
import {Validators, FormBuilder, FormGroup} from "@angular/forms";
import {CommandLineToolModel} from "cwlts/models/d2sb";
import {FormSectionComponent} from "../../../form-section/form-section.component";
import {AfterViewInit} from "../../../../../../node_modules/@angular/core/src/metadata/lifecycle_hooks";

@Component({
    selector: 'docker-image-form',
    directives: [
        FormSectionComponent
    ],
    template: `
        <ct-form-section>
            <div class="fs-header">
                Docker Image
            </div>
        
            <div class="fs-body">
                <form [formGroup]="dockerInputForm">
        
                    <label for="docker_image" class="form-control-label">Docker Repository</label>
                    <input name="dockerPull"
                           type="text"
                           class="form-control"
                           id="docker_image"
                           [formControl]="dockerInputForm.controls['dockerInput']"
                           [(ngModel)]="dockerPull">
                </form>
            </div>
        </ct-form-section>
            
    `
})
export class DockerImageFormComponent implements AfterViewInit {
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

    ngAfterViewInit(): void {
        // this.group.addControl('dockerInput', this.dockerInputForm.controls['dockerInput']);

    }
}
