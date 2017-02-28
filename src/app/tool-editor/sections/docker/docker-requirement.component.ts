import {ChangeDetectionStrategy, Component, Input, OnChanges, Output, SimpleChanges, ViewEncapsulation} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import {DockerRequirementModel} from "cwlts/models/d2sb";
import {ReplaySubject} from "rxjs";
import {DockerRequirement} from "cwlts/mappings/d2sb/DockerRequirement";
import {ComponentBase} from "../../../components/common/component-base";

@Component({
    encapsulation: ViewEncapsulation.None,

    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "ct-docker-requirement",
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
export class DockerRequirementComponent extends ComponentBase implements OnChanges {
    @Input()
    public dockerRequirement: DockerRequirementModel;

    @Input()
    public readonly = false;

    private form: FormGroup;

    @Output()
    public update = new ReplaySubject<DockerRequirement>();

    ngOnChanges(changes: SimpleChanges): void {
        this.form = new FormGroup({});

        const dockerPull = this.dockerRequirement ? this.dockerRequirement.dockerPull : "";
        this.form.addControl("dockerPull", new FormControl({value: dockerPull, disabled: this.readonly}));

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
