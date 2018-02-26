import {Component, EventEmitter, Input, Output} from "@angular/core";
import {DockerRequirement} from "cwlts/mappings/d2sb/DockerRequirement";
import {DockerRequirementModel} from "cwlts/models";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
    selector: "ct-docker-requirement",
    template: `
        <ct-form-panel>
            <div class="tc-header">
                Docker Image
            </div>

            <div class="tc-body">

                <form #form="ngForm">

                    <label for="docker_image" class="form-control-label">Docker Repository</label>
                    <input name="dockerPull"
                           [ngModel]="docker.dockerPull"
                           [disabled]="readonly"
                           (ngModelChange)="updateDockerPull($event)"
                           data-test="docker-pull-input"
                           type="text"
                           class="form-control"
                           id="docker_image">
                </form>
            </div>
        </ct-form-panel>
    `
})
export class DockerRequirementComponent extends DirectiveBase {
    @Input()
    docker = new DockerRequirementModel();

    @Input()
    readonly = false;

    @Output()
    update = new EventEmitter<DockerRequirement>();

    updateDockerPull(event) {
        this.docker.dockerPull = event;
        this.update.emit(this.docker);
    }

    ngOnChanges(): void {
        this.docker = this.docker || new DockerRequirementModel();
    }
}
