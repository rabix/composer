import {ChangeDetectorRef, Component, Input, OnInit, EventEmitter} from "@angular/core";
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
import {map, take, startWith, switchMap} from "rxjs/operators";
import {empty} from "rxjs/observable/empty";
import {combineLatest} from "rxjs/observable/combineLatest";

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
                    <input class="form-control" data-test="new-app-name" autofocus
                           placeholder="My New {{ destination === 'remote' ? remoteForm.get('type').value : localForm.get('type').value }}"
                           formControlName="name"/>
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

                <div class="form-group" *ngIf="destination === 'remote' && !defaultProject">
                    <label>Destination Project:</label>
                    <ct-auto-complete formControlName="project"
                                      [mono]="true"
                                      [options]="projectOptions"
                                      placeholder="Choose a destination project..."
                                      optgroupField="hash"
                                      data-test="new-app-destination-project"></ct-auto-complete>

                    <p class="project-list-status">
                        Showing {{ isShowingAllProjects ? 'all' : 'added' }} projects.
                        <button type="button" class="btn btn-link btn-inline-link"
                                (click)="toggleShowingAllProjects.emit(!isShowingAllProjects)">
                            Show {{ isShowingAllProjects ? 'added' : 'all' }}
                        </button>
                    </p>
                </div>

                <div *ngIf="destination === 'remote' && remoteAppCreationError ">
                    <span class="text-danger">
                        <i class="fa fa-times-circle fa-fw"></i>
                            {{ remoteAppCreationError }}
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

                <button type="submit" class="btn btn-primary" *ngIf="destination=== 'local'" [disabled]="!localForm.valid">
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

    projectOptions        = [];
    checkingSlug          = false;
    appTypeLocked         = false;
    appCreationInProgress = false;

    isShowingAllProjects        = true;
    canToggleShowingAllProjects = false;
    toggleShowingAllProjects    = new EventEmitter<boolean>();

    error: string;
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
        this.remoteForm.get("name").valueChanges.subscribeTracked(this, value => {
            this.remoteForm.patchValue({slug: this.slugify.transform(value)});
        });

        this.toggleShowingAllProjects.pipe(
            startWith(false),
            switchMap(() => combineLatest(
                this.platformRepository.getOpenProjects(),
                this.platformRepository.getProjects(),
            ), (shouldShowAll, projects) => ({shouldShowAll, projects})),
            map(data => {
                const {shouldShowAll, projects} = data;

                const openProjects = projects[0] || [];
                const allProjects = projects[1] || [];

                const openProjectsExist = openProjects.length !== 0;
                const canToggle         = openProjectsExist;
                const showProjects      = (!shouldShowAll && openProjectsExist) ? openProjects : allProjects;
                const showAll           = showProjects === allProjects;

                return {showAll, canToggle, projects: showProjects};
            })
        ).subscribeTracked(this, data => {
            const {showAll, canToggle, projects} = data;

            this.isShowingAllProjects        = showAll;
            this.canToggleShowingAllProjects = canToggle;

            this.projectOptions = projects.map((project: Project) => ({
                value: project.id,
                text: project.name
            }));

            this.cdr.markForCheck();
            this.cdr.detectChanges();

        });
    }

    submit() {

        if (this.destination === "local") {
            this.createLocal();
        } else {
            this.createRemote();
        }
    }

    chooseFilepath(): Promise<string> {

        const {app} = window["require"]("electron").remote;

        return this.getDefaultFolder(app).then(directoryPath => {

            const defaultFilename   = this.slugify.transform(`New ${this.appType}`) + ".cwl";
            const {name}            = this.localForm.getRawValue();
            const suggestedFilename = name ? (this.slugify.transform(name) + ".cwl") : defaultFilename;
            return {directoryPath, suggestedFilename};
        }).then(data => this.native.createFileChoiceDialog({
            title: "Choose a File Path",
            defaultPath: `${data.directoryPath}/${data.suggestedFilename}`,
            buttonLabel: "Done",
        })).catch(() => void 0);
    }

    createLocal() {
        this.error = undefined;

        this.chooseFilepath().then(path => {
            const {name, cwlVersion, type} = this.localForm.getRawValue();

            const fileBasename = AppHelper.getBasename(path, true);
            const folder       = AppHelper.getDirname(path);

            const app  = AppGeneratorService.generate(cwlVersion, type, fileBasename, name);
            const dump = YAML.dump(app);

            return {path, dump, folder};
        })
            .then(data => this.fileRepository.saveFile(data.path, data.dump).then(() => data))
            .then(data => {
                const {path, folder} = data;
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

            }).catch(err => this.error = err);

    }

    createRemote() {
        this.appCreationInProgress  = true;
        this.remoteAppCreationError = undefined;

        const {name, slug, project, type, cwlVersion} = this.remoteForm.getRawValue();

        const app = AppGeneratorService.generate(cwlVersion, type, slug, name);

        const newAppID = AppHelper.getAppIDWithRevision(`${project}/${slug}`, 0);


        this.platformRepository.createApp(newAppID, JSON.stringify(app, null, 4)).then(() => {

            this.platformRepository.getOpenProjects().pipe(
                switchMap(projects => {
                    if (~projects.indexOf(project)) {
                        return empty();
                    }
                    return this.platformRepository.addOpenProjects([project], true);
                }),
                take(1)
            ).toPromise();

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

    }

    private getDefaultFolder(app: any): Promise<string> {

        if (this.defaultFolder) {
            return Promise.resolve(this.defaultFolder);
        }

        return combineLatest(
            this.localRepository.getExpandedFolders(),
            this.localRepository.getLocalFolders()
        ).pipe(
            map(list => {
                const [expanded, all] = list;
                if (expanded.length) {
                    return expanded[expanded.length - 1];
                }

                if (all.length) {
                    return all[all.length - 1];
                }

                return app.getPath("home");
            }),
            take(1),
        ).toPromise();
    }

}
