import {ChangeDetectorRef, Component, Input, OnInit, AfterViewInit} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import * as YAML from "js-yaml";
import {SlugifyPipe} from "ngx-pipes";
import {Observable} from "rxjs/Observable";
import {Project} from "../../../../../electron/src/sbg-api-client/interfaces";
import {AuthService} from "../../../auth/auth.service";
import {AppGeneratorService} from "../../../cwl/app-generator/app-generator.service";
import {FileRepositoryService} from "../../../file-repository/file-repository.service";
import {LocalRepositoryService} from "../../../repository/local-repository.service";
import {PlatformRepositoryService} from "../../../repository/platform-repository.service";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {DataGatewayService} from "../../data-gateway/data-gateway.service";
import {AppHelper} from "../../helpers/AppHelper";
import {WorkboxService} from "../../workbox/workbox.service";
import {NativeSystemService} from "../../../native/system/native-system.service";

@Component({
    selector: "ct-create-app-modal",
    providers: [SlugifyPipe],
    template: `

        <form [formGroup]="destination === 'local' ? localForm : remoteForm" (ngSubmit)="submit()">
            <div class="p-1">

                <div *ngIf="!defaultFolder && !defaultProject && (auth.getActive() | async)"
                     class="destination-selection">
                    <div class="platform clickable"
                         data-test="new-app-local-files-tab"
                         [class.active]="destination === 'local'"
                         (click)="destination = 'local'">
                        <span><i class="fa fa-desktop"></i> Local Files</span>
                    </div>
                    <div class="platform clickable"
                         data-test="new-app-remote-tab"
                         [class.active]="destination === 'remote'"
                         (click)="destination = 'remote'">
                        <span><i class="fa fa-globe"></i> Platform</span>
                    </div>
                </div>

                <div class="form-group">
                    <label>App Name:</label>
                    <input class="form-control" formControlName="name" data-test="new-app-name"/>
                    <p *ngIf="destination === 'remote' && remoteForm.get('name').value" class="form-text text-muted">
                        App ID: {{ remoteForm.get('name').value | slugify}}
                    </p>
                </div>

                <div class="form-group">
                    <label class="">CWL Version:</label>
                    <select class="form-control" formControlName="cwlVersion" data-test="new-app-cwl-version">
                        <option value="v1.0" data-test="new-app-cwl-v1-option">v1.0</option>
                        <option value="d2sb" data-test="new-app-cwl-draft2-option">sbg:draft-2</option>
                    </select>
                </div>

                <div class="form-group col-sm-6" *ngIf="!appTypeLocked">
                    <label>App Type:</label>
                    <select class="form-control" formControlName="type" data-test="new-app-type">
                        <option value="Workflow" data-test="new-app-type-workflow">Workflow</option>
                        <option value="CommandLineTool" data-test="new-app-type-tool">Command Line tool</option>
                    </select>
                </div>

                <div class="form-group" *ngIf="destination === 'local'">
                    <label>Destination Path:</label>

                    <button class="btn btn-secondary block"
                            type="button"
                            data-test="new-app-choose-filepath-button"
                            (click)="chooseFilepath()">
                        {{ defaultFolder ? "Choose a File Name" : "Choose a Local Folder" }}
                    </button>

                    <p class="form-text text-muted" *ngIf="localForm.get('path').value">
                        Chosen Path: {{ localForm.get('path').value }}
                    </p>
                </div>

                <div class="form-group" *ngIf="destination === 'remote' && !defaultProject">
                    <label>Destination Project:</label>
                    <ct-auto-complete formControlName="project"
                                      [mono]="true"
                                      [options]="projectOptions"
                                      placeholder="Choose a destination project..."
                                      optgroupField="hash"
                                      data-test="new-app-destination-project"></ct-auto-complete>
                </div>

                <div *ngIf="destination === 'remote' && remoteAppCreationError ">
                    <span class="text-danger">
                        <i class="fa fa-times-circle fa-fw"></i>
                            {{ remoteAppCreationError }}
                    </span>
                </div>

                <div *ngIf="destination === 'local' && localAppCreationInfo">
                    <span class="text-info">
                        <i class="fa fa-info-circle fa-fw"></i>
                            {{ localAppCreationInfo }}
                    </span>
                </div>

            </div>


            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-test="new-app-cancel-button"
                        (click)="modal.close()"> Cancel
                </button>
                <button type="submit"
                        class="btn btn-primary"
                        data-test="new-app-create-button"
                        *ngIf="destination=== 'remote'"
                        [disabled]="!remoteForm.valid || appCreationInProgress">

                    <ct-loader-button-content [isLoading]="appCreationInProgress">
                        <span *ngIf="checkingSlug">Checking...</span>
                        <span *ngIf="!checkingSlug">Create</span>
                    </ct-loader-button-content>
                </button>

                <button type="submit" class="btn btn-primary" *ngIf="destination=== 'local'"
                        [disabled]="!localForm.valid">
                    Create
                </button>
            </div>
        </form>
    `,
    styleUrls: ["./create-app-modal.component.scss"],
})
export class CreateAppModalComponent extends DirectiveBase implements OnInit, AfterViewInit {

    @Input() appType: "CommandLineTool" | "Workflow" = "CommandLineTool";
    @Input() destination: "local" | "remote"         = "local";
    @Input() cwlVersion: "v1.0" | "d2sb"             = "v1.0";
    @Input() defaultFolder: string;
    @Input() defaultProject: string;

    projectOptions        = [];
    checkingSlug          = false;
    appTypeLocked         = false;
    appCreationInProgress = false;

    error: string;
    localAppCreationInfo: string;
    remoteAppCreationError: string;

    localForm: FormGroup;
    remoteForm: FormGroup;

    constructor(private dataGateway: DataGatewayService,
                public modal: ModalService,
                public auth: AuthService,
                private slugify: SlugifyPipe,
                private cdr: ChangeDetectorRef,
                private workbox: WorkboxService,
                private platformRepository: PlatformRepositoryService,
                private localRepository: LocalRepositoryService,
                private fileRepository: FileRepositoryService,
                private native: NativeSystemService) {

        super();
    }

    ngOnInit() {

        if (this.appType) {
            this.appTypeLocked = true;
        }

        this.localForm = new FormGroup({
            name: new FormControl("", [Validators.required]),
            path: new FormControl(undefined, [Validators.required]),
            cwlVersion: new FormControl("v1.0", [Validators.required]),
            type: new FormControl(this.appType, [Validators.required])
        });

        this.remoteForm = new FormGroup({
            name: new FormControl("", [Validators.required]),
            slug: new FormControl("", [Validators.required]),
            project: new FormControl(this.defaultProject, [Validators.required]),
            cwlVersion: new FormControl("v1.0", [Validators.required]),
            type: new FormControl(this.appType, [Validators.required])
        });

        // Transform remote name changes into slug value
        this.remoteForm.get("name").valueChanges.subscribeTracked(this, (value) => this.remoteForm.patchValue({slug: this.slugify.transform(value)}));


        // Check out open projects on platform and map them to select box options
        this.platformRepository.getOpenProjects()
            .map(projects => projects || [])
            .subscribeTracked(this, projects => {
                this.projectOptions = projects.map((project: Project) => ({
                    value: project.id,
                    text: project.name
                }));
            });
    }

    ngAfterViewInit() {
        if (this.destination === "local") {
            this.chooseFilepath();
        }
    }

    submit() {

        if (this.destination === "local") {
            this.createLocal();
        } else {
            this.createRemote();
        }
    }

    chooseFilepath() {

        const {app} = window["require"]("electron").remote;

        const defaultFolder = Observable.combineLatest(
            this.localRepository.getExpandedFolders(),
            this.localRepository.getLocalFolders()
        ).map(list => {
            const [expanded, all] = list;
            if (expanded.length) {
                return expanded[expanded.length - 1];
            }

            if (all.length) {
                return all[all.length - 1];
            }

            return app.getPath("home");
        }).take(1);

        defaultFolder.subscribeTracked(this, directoryPath => {

            const defaultFilename   = this.slugify.transform(`New ${this.appType}`) + ".cwl";
            const {name}            = this.localForm.getRawValue();
            const suggestedFilename = name ? (this.slugify.transform(name) + ".cwl") : defaultFilename;

            this.native.createFileChoiceDialog({
                title: "Choose a File Path",
                defaultPath: `${directoryPath}/${suggestedFilename}`,
                buttonLabel: "Done",
            }).then((path) => {

                // Indication of whether we need to add .cwl extension to the file name
                this.localAppCreationInfo = undefined;

                // If user did not choose anything, do nothing
                if (!path) {
                    return;
                }

                if (!AppHelper.endsWithAppExtension(path)) {
                    path += ".cwl";
                    this.localAppCreationInfo = "Extension .cwl was added to the file name.";
                }

                this.localForm.patchValue({
                    path: path,
                    name: name || this.toTitleCase(AppHelper.getBasename(path, true))
                });

                setTimeout(() => {
                    this.cdr.markForCheck();
                    this.cdr.detectChanges();
                });

            }, () => {
            });
        });
    }

    createLocal() {
        this.error                = undefined;
        this.localAppCreationInfo = undefined;

        const {path, name, cwlVersion, type} = this.localForm.getRawValue();

        const fileBasename = AppHelper.getBasename(path, true);
        const folder       = AppHelper.getDirname(path);

        const app  = AppGeneratorService.generate(cwlVersion, type, fileBasename, name);
        const dump = YAML.dump(app);

        this.fileRepository.saveFile(path, dump).then(() => {

            this.fileRepository.reloadPath(folder);

            const tabData = {
                id: path,
                isWritable: true,
                language: "yaml",
                label: path.split("/").pop(),
                type: this.appType,
            };

            this.workbox.openTab(this.workbox.getOrCreateAppTab(tabData));
            this.modal.close();
        }, err => {
            this.error = err;
        });
    }

    createRemote() {
        this.appCreationInProgress  = true;
        this.remoteAppCreationError = undefined;

        const {name, slug, project, type, cwlVersion} = this.remoteForm.getRawValue();

        const app = AppGeneratorService.generate(cwlVersion, type, slug, name);

        const newAppID = AppHelper.getAppIDWithRevision(`${project}/${slug}`, 0);

        this.platformRepository.createApp(newAppID, JSON.stringify(app, null, 4)).then(() => {

            const tab = this.workbox.getOrCreateAppTab({
                id: AppHelper.getRevisionlessID(newAppID),
                type: this.appType,
                label: name,
                isWritable: true,
                language: "json"
            });

            this.workbox.openTab(tab);
            this.modal.close();
        }, err => {
            this.remoteAppCreationError = err.message;
            this.appCreationInProgress  = false;
        });

        return;
    }

    private toTitleCase(str: string): string {
        return str.replace(/\s+|[-_]/gi, " ").replace(/\w\S*/g, word => word[0].toUpperCase() + word.substr(1).toLowerCase())
    }
}
