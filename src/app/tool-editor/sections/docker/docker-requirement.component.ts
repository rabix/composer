import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges
} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import {DockerRequirement} from "cwlts/mappings/d2sb/DockerRequirement";
import {DockerRequirementModel} from "cwlts/models";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
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
export class DockerRequirementComponent extends DirectiveBase implements OnChanges, OnDestroy, OnInit {
    @Input()
    public docker: DockerRequirementModel;

    @Input()
    public readonly = false;

    public form: FormGroup;

    @Output()
    public update = new ReplaySubject<DockerRequirement>();

    ngOnChanges(changes: SimpleChanges): void {
        if (this.form && changes["docker"].currentValue) {
            this.form.controls["dockerPull"].setValue(changes["docker"].currentValue.dockerPull, {onlySelf: true});
        }
    }

    ngOnInit() {
        this.form = new FormGroup({});

        const dockerPull = this.docker ? this.docker.dockerPull : "";
        this.form.addControl("dockerPull", new FormControl({
            value: dockerPull,
            disabled: this.readonly
        }));

        this.tracked = this.form.valueChanges.subscribe(change => {
            this.docker.dockerPull = change.dockerPull;
            this.update.next(this.docker);
        });
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.form.removeControl("dockerPull");
    }
}
