import {Component, Input, OnInit, Output} from "@angular/core";
import {FormGroup, FormControl} from "@angular/forms";
import {DockerRequirementModel} from "cwlts/models/d2sb";
import {FormPanelComponent} from "../../../../core/elements/form-panel.component";
import {ReplaySubject} from "rxjs";
import {ComponentBase} from "../../../common/component-base";
import {DockerRequirement} from "cwlts/mappings/d2sb/DockerRequirement";

@Component({
    selector: 'ct-docker-image-form',
    template: `
        <ct-form-panel>
            <div class="tc-header">
                Docker Image
            </div>
        
            <div class="tc-body">
                <form [formGroup]="form" *ngIf="form">
        
                    <label for="docker_image" class="form-control-label">Docker Repository</label>
                    <input name="dockerPull"
                           type="text"
                           class="form-control"
                           id="docker_image"
                           [formControl]="form.controls['dockerPull']">
                </form>
            </div>
        </ct-form-panel>
    `
})
export class DockerImageFormComponent extends ComponentBase implements OnInit {
    @Input()
    public dockerRequirement: DockerRequirementModel;

    /** The parent forms control group */
    @Input()
    public form: FormGroup;

    @Output()
    public update = new ReplaySubject<DockerRequirement>();

    ngOnInit(): void {
        const dockerPull = this.dockerRequirement ? this.dockerRequirement.dockerPull : "";
        this.form.addControl("dockerPull", new FormControl(dockerPull));

        this.tracked = this.form.valueChanges.subscribe(changes => {
            const docker: DockerRequirement = this.dockerRequirement ?
                this.dockerRequirement.serialize() :
                new DockerRequirementModel();

            docker.dockerPull = changes["dockerPull"];
            this.update.next(docker);
        });
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.form.removeControl("dockerPull");
    }
}
