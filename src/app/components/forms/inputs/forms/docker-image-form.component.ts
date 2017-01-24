import {Component, Input, Output, OnChanges, SimpleChanges, ChangeDetectionStrategy} from "@angular/core";
import {FormGroup, FormControl} from "@angular/forms";
import {DockerRequirementModel} from "cwlts/models/d2sb";
import {ReplaySubject} from "rxjs";
import {ComponentBase} from "../../../common/component-base";
import {DockerRequirement} from "cwlts/mappings/d2sb/DockerRequirement";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
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
export class DockerImageFormComponent extends ComponentBase implements OnChanges {
    @Input()
    public dockerRequirement: DockerRequirementModel;

    private form: FormGroup;

    @Output()
    public update = new ReplaySubject<DockerRequirement>();

    ngOnChanges(changes: SimpleChanges): void {
        this.form = new FormGroup({});

        const dockerPull = this.dockerRequirement ? this.dockerRequirement.dockerPull : "";
        this.form.addControl("dockerPull", new FormControl(dockerPull));

        this.form.valueChanges.first().subscribe(changes => {
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
