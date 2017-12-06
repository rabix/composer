import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {SlugifyPipe} from "ngx-pipes";
import {PlatformAppSavingService} from "../../../editor-common/services/app-saving/platform-app-saving.service";
import {PlatformRepositoryService} from "../../../repository/platform-repository.service";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {DataGatewayService} from "../../data-gateway/data-gateway.service";
import {FormAsyncValidator} from "../../forms/helpers/form-async-validator";
import {ErrorWrapper} from "../../helpers/error-wrapper";

@Component({
    selector: "ct-publish-modal",
    providers: [SlugifyPipe, PlatformAppSavingService],
    template: `
        <form [formGroup]="inputForm" (submit)="onSubmit()">

            <div class="p-1">

                <div class="form-group">
                    <label class="">App Name:</label>
                    <input class="form-control" formControlName="name"/>

                    <p *ngIf="inputForm.controls.name" class="form-text text-muted">
                        App ID: {{ inputForm.controls.name.value | slugify }}
                    </p>
                </div>

                <div class="form-group">
                    <label>Destination Project:</label>
                    <ct-auto-complete formControlName="project" data-test="app-project"
                                      [mono]="true"
                                      [options]="projectOptions"
                                      placeholder="Choose a destination project...">
                    </ct-auto-complete>
                </div>

                <div class="form-group" *ngIf="revision > 0">
                    <label>Revision Note:</label>
                    <input class="form-control" [formControl]="outputForm.controls.revisionNote"/>
                    <div class="form-text text-muted">
                        An app with this ID already exists.<br/>
                        Pushing will create a revision <strong>{{ revision }}</strong>.
                    </div>
                </div>

                <div *ngIf="error">                
                    <span class="text-danger">
                        <i class="fa fa-times-circle fa-fw"></i>
                            {{error}}
                    </span>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" (click)="close()">Cancel</button>
                    <button type="submit" class="btn btn-primary" [disabled]="!inputForm.valid || isPublishing">
                        <ct-loader-button-content [isLoading]="inputForm.pending || isPublishing">Push</ct-loader-button-content>
                    </button>
                </div>
            </div>
        </form>
    `,
    styleUrls: ["./publish-modal.component.scss"],
})
export class PublishModalComponent extends DirectiveBase implements OnInit {

    @Input()
    appContent: string;

    @Output()
    published = new EventEmitter<string>();

    error: string;

    projectOptions = [];

    isPublishing = false;

    revision: number = 0;

    inputForm: FormGroup;

    outputForm: FormGroup;

    constructor(private dataGateway: DataGatewayService,
                public modal: ModalService,
                private platformRepository: PlatformRepositoryService,
                private slugify: SlugifyPipe) {

        super();
    }

    ngOnInit() {
        this.inputForm = new FormGroup({
            name: new FormControl("", [Validators.required]),
            project: new FormControl("", [Validators.required]),
        }, null, FormAsyncValidator.debounceValidator((group: FormGroup) => {
            const {name, project} = group.getRawValue();

            const appID = `${project}/${this.slugify.transform(name.toLowerCase())}/${this.revision}`;

            return this.dataGateway.fetchFileContent(appID, true).toPromise().then((app: any) => {
                this.revision = app["sbg:latestRevision"] + 1;
                return Promise.resolve(null);
            }, () => {
                this.revision = 0;
                return Promise.resolve(null);
            });

        }));

        this.outputForm = new FormGroup({
            revisionNote: new FormControl(undefined),
            appID: new FormControl(undefined, [Validators.required]),
            content: new FormControl(this.appContent)
        });

        this.inputForm.statusChanges.filter(() => this.inputForm.valid).subscribe(() => {
            const {name, project} = this.inputForm.getRawValue();
            this.outputForm.patchValue({
                appID: project + "/" + this.slugify.transform(name.toLowerCase()) + "/" + this.revision
            });
        });

        this.platformRepository.getOpenProjects()
            .map(projects => projects || [])
            .take(1)
            .subscribeTracked(this, (projects) => this.projectOptions = projects.map(project => ({
                value: project.id,
                text: project.name
            })));
    }

    onSubmit() {
        const {revisionNote, appID, content} = this.outputForm.getRawValue();

        this.isPublishing = true;
        let saveCall: Promise<any>;

        if (this.revision === 0) {
            saveCall = this.platformRepository.createApp(appID, content);
        } else {
            saveCall = this.platformRepository.saveAppRevision(appID, content, revisionNote);
        }

        saveCall.then(() => {
            this.isPublishing = false;
            this.published.emit(appID);
            this.close();
            return appID;
        }, (err) => {
            this.error        = "Failed to push the app. " + new ErrorWrapper(err);
            this.isPublishing = false;
        });
    }

    close() {
        this.modal.close();
    }


}
