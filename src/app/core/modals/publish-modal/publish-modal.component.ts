import {Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {SlugifyPipe} from "ngx-pipes";
import {PlatformAppSavingService} from "../../../editor-common/services/app-saving/platform-app-saving.service";
import {PlatformRepositoryService} from "../../../repository/platform-repository.service";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {DataGatewayService} from "../../data-gateway/data-gateway.service";
import {FormAsyncValidator} from "../../forms/helpers/form-async-validator";
import {ErrorWrapper} from "../../helpers/error-wrapper";
import {App} from "../../../../../electron/src/sbg-api-client/interfaces/app";
import * as unidecode from "unidecode";

@Component({
    selector: "ct-publish-modal",
    providers: [SlugifyPipe, PlatformAppSavingService],
    template: `
        <form [formGroup]="inputForm" (submit)="onSubmit()">

            <div class="p-1">

                <div class="form-group">
                    <label>Destination Project:</label>
                    <ct-auto-complete formControlName="project" data-test="app-project"
                                      [mono]="true"
                                      [options]="projectOptions"
                                      placeholder="Choose a destination project...">
                    </ct-auto-complete>

                    <p class="form-text text-muted">
                        Only projects from the file tree are visible on this list
                    </p>
                </div>

                <div class="form-group">
                    <label class="">App ID:</label>
                    <ct-auto-complete formControlName="id" data-test="app-project"
                                      [create]="true"
                                      [mono]="true"
                                      [options]="appOptions"
                                      placeholder="Choose an app id...">
                    </ct-auto-complete>

                    <p class="form-text text-danger" [class.hidden]="!inputForm.controls['id'].value || inputForm.controls['id'].valid">
                        App id can only contain numeric, lowercase alphabetic, and hyphen characters
                    </p>
                    <p class="form-text text-muted">
                        Choose an existing app if you want to publish as a new revision
                    </p>
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

    @Input()
    appID: string;

    @Output()
    published = new EventEmitter<string>();

    error: string;

    appOptions = [];

    projectOptions = [];

    isPublishing = false;

    revision: number = 0;

    inputForm: FormGroup;

    outputForm: FormGroup;

    constructor(private dataGateway: DataGatewayService,
                public modal: ModalService,
                private cdr: ChangeDetectorRef,
                private platformRepository: PlatformRepositoryService,
                private slugify: SlugifyPipe) {

        super();
    }

    ngOnInit() {
        this.inputForm = new FormGroup({
            id: new FormControl(this.formatAppID(this.appID), [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]),
            project: new FormControl("", [Validators.required]),
        }, null, FormAsyncValidator.debounceValidator((group: FormGroup) => {
            const {id, project} = group.getRawValue();

            const appID = `${project}/${this.slugify.transform(id.toLowerCase())}/0`;

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
            const {id, project} = this.inputForm.getRawValue();
            this.outputForm.patchValue({
                appID: `${project}/${this.slugify.transform(id.toLowerCase())}/${this.revision}`
            });
        });

        this.platformRepository.getOpenProjects()
            .map(projects => projects || [])
            .take(1)
            .subscribeTracked(this, (projects) => this.projectOptions = projects.map(project => ({
                value: project.id,
                text: project.name
            })));

        this.inputForm.controls["project"].valueChanges
            .flatMap(val =>  {
                return this.platformRepository.getAppsForProject(val);
            })
            .subscribeTracked(this, (apps: App[]) => {
                this.appOptions = apps.map(app => ({value: app.id.split("/")[2], text: app.id.split("/")[2]}));
            });
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

    private formatAppID(id: string) {
        /*
         * Unidecode represents UTF-8 characters in US-ASCII characters
         * All special characters should be replaced with hyphens,
         * and leading and trailing hyphens should then be removed
         */
        return unidecode(id).replace(/[^a-z1-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
    }

    close() {
        this.modal.close();
    }
}
