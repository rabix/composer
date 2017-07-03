import {ChangeDetectorRef, Component, Input, OnInit} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import * as YAML from "js-yaml";
import {SlugifyPipe} from "ngx-pipes";
import {Observable} from "rxjs/Observable";
import {Project} from "../../../../../electron/src/sbg-api-client/interfaces/project";
import {AppGeneratorService} from "../../../cwl/app-generator/app-generator.service";
import {LocalFileRepositoryService} from "../../../file-repository/local-file-repository.service";
import {LocalRepositoryService} from "../../../repository/local-repository.service";
import {PlatformRepositoryService} from "../../../repository/platform-repository.service";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {DataGatewayService} from "../../data-gateway/data-gateway.service";
import {WorkboxService} from "../../workbox/workbox.service";

const {app, dialog} = window["require"]("electron").remote;

@Component({
    selector: "ct-create-app-modal",
    providers: [SlugifyPipe],
    template: `
        <div *ngIf="!defaultFolder && !defaultProject" class="destination-selection">
            <div class="platform clickable" [class.active]="destination === 'local'" (click)="destination = 'local'">
                <span><i class="fa fa-desktop"></i> Local Files</span>
            </div>
            <div class="platform clickable" [class.active]="destination === 'remote'" (click)="destination = 'remote'">
                <span><i class="fa fa-globe"></i> Seven Bridges</span>
            </div>
        </div>

        <div class="p-1">

            <div *ngIf="!defaultFolder" class="form-group">
                <label class="">App Name:</label>
                <input class="form-control" *ngIf="destination=== 'remote'" [formControl]="remoteNameControl"/>
                <input class="form-control" *ngIf="destination=== 'local'" [formControl]="localNameControl"/>

                <p *ngIf="destination === 'remote' && remoteNameControl.value" class="form-text text-muted">
                    App ID: {{ remoteSlugControl.value }}
                </p>
            </div>

            <div *ngIf="defaultFolder" class="form-group">
                <label>File Name:</label>
                <input class="form-control" [formControl]="localFileControl">
            </div>

            <div class="row">
                <div class="form-group"
                     [class.col-sm-6]="!appTypeLocked"
                     [class.col-sm-12]="appTypeLocked">
                    <label class="">CWL Version:</label>
                    <select class="form-control" [(ngModel)]="cwlVersion">
                        <option value="v1.0">v1.0</option>
                        <option value="d2sb">sbg:draft-2</option>
                    </select>
                </div>

                <div class="form-group col-sm-6"
                     [class.hidden]="appTypeLocked">
                    <label class="">App Type:</label>
                    <select class="form-control" [(ngModel)]="appType">
                        <option value="workflow">Workflow</option>
                        <option value="tool">Command Line tool</option>
                    </select>
                </div>
            </div>

            <div class="form-group" *ngIf="destination === 'local'">
                <label>Destination Path:</label>
                <button *ngIf="!defaultFolder" class="btn btn-secondary block" type="button" (click)="chooseFolder()">Choose a Local Path
                </button>
                <p class="form-text text-muted"
                   *ngIf="chosenLocalFilename || defaultFolder">
                    Chosen Path: {{ chosenPath() }}
                </p>
            </div>

            <div class="form-group" *ngIf="destination === 'remote'">
                <label>Destination Project:</label>
                <ct-auto-complete [formControl]="projectSelection"
                                  [mono]="true"
                                  [options]="projectOptions"
                                  placeholder="Choose a destination project..."
                                  optgroupField="hash"></ct-auto-complete>
            </div>

            <div class="alert alert-danger" *ngIf="localFileControl.errors && localFileControl.errors.exists">
                A file with this name already exists. Choose another name!
            </div>

            <div class="alert alert-danger" *ngIf="destination === 'remote' && remoteAppCreationError ">
                {{ remoteAppCreationError }}
            </div>


            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="modal.close()"> Cancel</button>
                <button type="button"
                        (click)="createRemote()"
                        class="btn btn-primary"
                        *ngIf="destination=== 'remote'"
                        [disabled]="!platformGroup.valid || appCreationInProgress">

                    <ct-loader-button-content [isLoading]="appCreationInProgress">
                        <span *ngIf="checkingSlug">Checking...</span>
                        <span *ngIf="!checkingSlug">Create</span>
                    </ct-loader-button-content>
                </button>

                <button type="button"
                        class="btn btn-primary"
                        *ngIf="destination=== 'local'"
                        (click)="createLocal()"
                        [disabled]="isLocalButtonDisabled()">
                    Create
                </button>
            </div>
        </div>
    `,
    styleUrls: ["./create-app-modal.component.scss"],
})
export class CreateAppModalComponent extends DirectiveBase implements OnInit {

    @Input() appType: "tool" | "workflow"    = "tool";
    @Input() destination: "local" | "remote" = "local";
    @Input() cwlVersion: "v1.0" | "d2sb"     = "v1.0";
    @Input() chosenLocalFilename             = "";
    @Input() defaultFolder: string;
    @Input() defaultProject: string;
             platformGroup: FormGroup;
             projectSelection: FormControl;
             localNameControl: FormControl;
             localFileControl: FormControl;
             remoteNameControl: FormControl;
             remoteSlugControl: FormControl;
             error: string;
             projectOptions                  = [];
             checkingSlug                    = false;
             appTypeLocked                   = false;
             appCreationInProgress           = false;
             remoteAppCreationError;

    constructor(private dataGateway: DataGatewayService,
                public modal: ModalService,
                private slugify: SlugifyPipe,
                private cdr: ChangeDetectorRef,
                private workbox: WorkboxService,
                private platformRepository: PlatformRepositoryService,
                private localRepository: LocalRepositoryService,
                private localFileRepository: LocalFileRepositoryService) {

        super();

        this.remoteNameControl = new FormControl("", [Validators.required]);
        this.remoteSlugControl = new FormControl("", [Validators.required]);
        this.localNameControl  = new FormControl("", [Validators.required]);

        this.remoteNameControl.valueChanges
            .map(value => this.slugify.transform(value))
            .subscribeTracked(this, val => this.remoteSlugControl.setValue(val));

        /** Check out open projects on platform and map them to select box options */
        this.platformRepository.getOpenProjects().subscribeTracked(this, projects => {
            this.projectOptions = projects.map((project: Project) => ({
                value: project.id,
                text: project.name
            }));
        });
    }

    ngOnInit() {
        if (this.appType) {
            this.appTypeLocked = true;
        }

        this.localFileControl = new FormControl("",
            [Validators.required, Validators.pattern("^[a-zA-Zа-яА-Я0-9_!-]+$")],
            [this.hasLocalFileAsyncValidator.bind(this)]);

        this.projectSelection = new FormControl(this.defaultProject || "", [Validators.required]);

        this.platformGroup = new FormGroup({
            name: this.remoteSlugControl,
            project: this.projectSelection,
        });

        this.tracked = this.localFileControl.valueChanges
            .debounceTime(300)
            .subscribe(val => {
                this.chosenLocalFilename = val ? val + ".cwl" : "";
            });
    }

    chooseFolder() {

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

        defaultFolder.subscribeTracked(this, path => {

            const defaultFilename   = `new-${this.appType}.cwl`;
            const val               = this.localNameControl.value;
            const suggestedFilename = val ? (this.slugify.transform(val) + ".cwl") : defaultFilename;

            dialog.showSaveDialog({
                title: "Choose a File Path",
                defaultPath: `${path}/${suggestedFilename}`,
                buttonLabel: "Done",
                properties: ["openDirectory"]
            }, (path) => {
                this.chosenLocalFilename = path;
                if (path && !val) {
                    this.localNameControl.setValue(path.split("/").pop());
                }

                this.cdr.markForCheck();
                this.cdr.detectChanges();
            });
        });
    }

    createLocal() {
        this.error = undefined;

        const appName      = this.defaultFolder ? this.localFileControl.value : this.localNameControl.value;
        const filename     = this.defaultFolder ? this.defaultFolder + this.chosenLocalFilename : this.chosenLocalFilename;
        const filesplit    = filename.split("/");
        const fileBasename = filesplit.pop();
        const folder       = filesplit.join("/");

        const app  = AppGeneratorService.generate(this.cwlVersion, this.appType, fileBasename, appName);
        const dump = YAML.dump(app);

        this.dataGateway.saveLocalFileContent(filename, dump).subscribe(_ => {
            this.localFileRepository.reloadPath(folder);

            this.workbox.openTab(this.workbox.getOrCreateAppTab({
                id: filename,
                isWritable: true,
                language: "yaml",
                label: filename.split("/").pop(),
                type: this.appType === "workflow" ? "Workflow" : "CommandLineTool",
            }));

            this.modal.close();
        }, err => {
            this.error = err;
        });
    }

    createRemote() {
        this.appCreationInProgress  = true;
        this.remoteAppCreationError = undefined;

        const slug  = this.remoteSlugControl.value;
        const label = this.remoteNameControl.value;
        const app   = AppGeneratorService.generate(this.cwlVersion, this.appType, slug, label);

        const newAppID = `${this.projectSelection.value}/${slug}`.split("/").slice(0, 3).concat("0").join("/");

        this.platformRepository.createApp(newAppID, JSON.stringify(app, null, 4)).then(app => {
            const tab = this.workbox.getOrCreateAppTab({
                id: newAppID,
                type: this.appType === "workflow" ? "Workflow" : "CommandLineTool",
                label: label,
                isWritable: true,
                language: "json"
            });
            this.workbox.openTab(tab);
            this.modal.close();

            this.appCreationInProgress = false;
        }, err => {
            this.remoteAppCreationError = err.message;
            this.appCreationInProgress  = false;
        });

        return;
    }

    hasLocalFileAsyncValidator(control: FormControl) {
        return new Promise(resolve => {

            this.dataGateway.checkIfPathExists(this.defaultFolder + control.value + ".cwl")
                .subscribe((val) => {
                    if (val.exists) {
                        resolve({"exists": true});
                    } else {
                        resolve(null);
                    }
                });
        });
    }

    /**
     * @FIXME(nikolab): remove nested ternary operators, remove function call from template, change detenction performance
     */
    chosenPath() {
        return this.defaultFolder ? this.localFileControl.valid ?
            this.defaultFolder + this.chosenLocalFilename :
            this.defaultFolder : this.chosenLocalFilename;
    }

    /**
     * @FIXME(nikolab): remove function call from template, change detection performance
     */
    isLocalButtonDisabled() {
        return (this.defaultFolder && this.localFileControl.invalid) ||
            (!this.defaultFolder && this.localNameControl.invalid) ||
            !this.chosenLocalFilename;
    }


}
