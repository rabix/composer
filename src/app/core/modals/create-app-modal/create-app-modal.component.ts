import {ChangeDetectorRef, Component, Input, OnInit} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import * as YAML from "js-yaml";
import {SlugifyPipe} from "ngx-pipes";
import {Observable} from "rxjs/Observable";
import {Project} from "../../../../../electron/src/sbg-api-client/interfaces/project";
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

@Component({
    selector: "ct-create-app-modal",
    providers: [SlugifyPipe],
    template: `

        <form [formGroup]="destination === 'local' ? localForm : remoteForm" (ngSubmit)="submit()">
            <div class="p-1">

                <div *ngIf="!defaultFolder && !defaultProject && (auth.getActive() | async)"
                     class="destination-selection">
                    <div class="platform clickable" [class.active]="destination === 'local'"
                         (click)="destination = 'local'">
                        <span><i class="fa fa-desktop"></i> Local Files</span>
                    </div>
                    <div class="platform clickable" [class.active]="destination === 'remote'"
                         (click)="destination = 'remote'">
                        <span><i class="fa fa-globe"></i> Remote</span>
                    </div>
                </div>

                <div class="form-group">
                    <label>App Name:</label>
                    <input class="form-control" formControlName="name"/>
                    <p *ngIf="destination === 'remote' && remoteForm.get('name').value"
                       class="form-text text-muted">
                        App ID: {{ remoteForm.get('name').value | slugify}}
                    </p>
                </div>

                <div class="form-group">
                    <label class="">CWL Version:</label>
                    <select class="form-control" formControlName="cwlVersion">
                        <option value="v1.0">v1.0</option>
                        <option value="d2sb">sbg:draft-2</option>
                    </select>
                </div>

                <div class="form-group col-sm-6" *ngIf="!appTypeLocked">
                    <label>App Type:</label>
                    <select class="form-control" formControlName="type">
                        <option value="Workflow">Workflow</option>
                        <option value="CommandLineTool">Command Line tool</option>
                    </select>
                </div>

                <div class="form-group" *ngIf="destination === 'local'">
                    <label>Destination Path:</label>

                    <button class="btn btn-secondary block" type="button"
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
                                      optgroupField="hash"></ct-auto-complete>
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
                <button type="button" class="btn btn-secondary" (click)="modal.close()"> Cancel
                </button>
                <button type="submit" class="btn btn-primary" *ngIf="destination=== 'remote'"
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
export class CreateAppModalComponent extends DirectiveBase implements OnInit {

    @Input() appType: "CommandLineTool" | "Workflow" = "CommandLineTool";
    @Input() destination: "local" | "remote"         = "local";
    @Input() cwlVersion: "v1.0" | "d2sb"             = "v1.0";
    @Input() defaultFolder: string;
    @Input() defaultProject: string;

    error: string;
    projectOptions        = [];
    checkingSlug          = false;
    appTypeLocked         = false;
    appCreationInProgress = false;
    remoteAppCreationError;
    localAppCreationInfo;

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
                private fileRepository: FileRepositoryService) {

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

    submit() {

        if (this.destination === "local") {
            this.createLocal();
        } else {
            this.createRemote();
        }
    }

    chooseFilepath() {

        const {app, dialog} = window["require"]("electron").remote;

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
            const suggestedFilename = name ? // if the name exists, create filename from it
                (/.cwl$|.yaml$|.json$|.yml$/.test(name) ? name : (this.slugify.transform(name) + ".cwl")) :
                defaultFilename; // otherwise just use defaultFilename
            let addExtension        = false;
            this.localAppCreationInfo = null;

            dialog.showSaveDialog({
                title: "Choose a File Path",
                defaultPath: `${directoryPath}/${suggestedFilename}`,
                buttonLabel: "Done",
                properties: ["openDirectory"]
            }, (path) => {

                if (!path) {
                    return;
                } else if (!/.cwl$|.yaml$|.json$|.yml$/.test(path)) {
                    // if path doesn't end with one of the extensions we recognize as a tool or workflow
                    // ensure the path still gets an extension even if "hide extension" was checked
                    if (`${directoryPath}/${suggestedFilename}` !== path + ".cwl") {
                        // but only show message if the user changed the file name, to inform them
                        // that we've modified it
                        this.localAppCreationInfo = "Extension .cwl was added to the file name.";
                    }
                    addExtension = true;
                }

                this.localForm.patchValue({
                    path: addExtension ? path + ".cwl" : path,
                    name: name || path.split("/").pop()
                });

                setTimeout(() => {
                    this.cdr.markForCheck();
                    this.cdr.detectChanges();
                });

            });
        });
    }

    createLocal() {
        this.error                = undefined;
        this.localAppCreationInfo = undefined;

        const {path, name, cwlVersion, type} = this.localForm.getRawValue();
        const filesplit                      = path.split("/");
        const fileBasename                   = filesplit.pop();
        const folder                         = filesplit.join("/");

        const app  = AppGeneratorService.generate(cwlVersion, type, fileBasename, name);
        const dump = YAML.dump(app);

        this.dataGateway.saveLocalFileContent(path, dump).subscribeTracked(this, () => {
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

        const newAppID = `${project}/${slug}`.split("/").slice(0, 3).concat("0").join("/");

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
}
