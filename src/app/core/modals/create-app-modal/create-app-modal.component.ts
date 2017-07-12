import {ChangeDetectorRef, Component, Input, OnInit} from "@angular/core";
import {UserPreferencesService} from "../../../services/storage/user-preferences.service";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {DataGatewayService} from "../../data-gateway/data-gateway.service";
import {SlugifyPipe} from "ngx-pipes";
import {FormControl, Validators, FormGroup} from "@angular/forms";
import {AuthService} from "../../../auth/auth/auth.service";
import {PlatformAPIGatewayService} from "../../../auth/api/platform-api-gateway.service";
import {AppGeneratorService} from "../../../cwl/app-generator/app-generator.service";
const {app, dialog} = window["require"]("electron").remote;
import * as YAML from "js-yaml";
import {WorkboxService} from "../../workbox/workbox.service";
import {Observable} from "rxjs/Observable";

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

            <div class="form-group" *ngIf="destination === 'remote'" [class.hidden]="defaultProject">
                <label>Destination Project:</label>
                <ct-auto-complete [formControl]="projectSelection"
                                  [mono]="true"
                                  [options]="projectOptions"
                                  [optgroups]="platformOptgroups"
                                  placeholder="Choose a destination project..."
                                  optgroupField="hash"></ct-auto-complete>
            </div>
            
            <div class="alert alert-danger" *ngIf="localFileControl.errors && localFileControl.errors.exists">
                A file with this name already exists. Choose another name!
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="modal.close()"> Cancel</button>
                <button type="button"
                        (click)="createRemote()"
                        class="btn btn-primary"
                        *ngIf="destination=== 'remote'"
                        [disabled]="platformGroup.invalid">
                    <span *ngIf="checkingSlug">Checking...</span>
                    <span *ngIf="!checkingSlug">Create</span>
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
             platformOptgroups               = [];
             checkingSlug                    = false;
             appTypeLocked                   = false;

    constructor(private dataGateway: DataGatewayService,
                public modal: ModalService,
                private slugify: SlugifyPipe,
                private apiGateway: PlatformAPIGatewayService,
                private cdr: ChangeDetectorRef,
                private workbox: WorkboxService,
                private preferences: UserPreferencesService) {

        super();

        this.remoteNameControl = new FormControl("", [Validators.required]);
        this.remoteSlugControl = new FormControl("", [Validators.required]);
        this.localNameControl  = new FormControl("", [Validators.required]);

        this.remoteNameControl.valueChanges
            .map(value => this.slugify.transform(value))
            .subscribe(val => this.remoteSlugControl.setValue(val));

        this.tracked = this.dataGateway.getProjectsForAllConnections().withLatestFrom(
            this.preferences.getOpenProjects(),
            (data, openProjects) => ({...data, openProjects}))
            .subscribe(data => {

                const {credentials, listings, openProjects} = data;
                this.platformOptgroups                      = credentials.map(creds => ({value: creds.hash, label: creds.profile}));
                this.projectOptions                         = listings.reduce((acc, listing, index) => {
                    return acc.concat(listing.map((entry: any) => {
                        return {
                            value: credentials[index].hash + `/${entry.owner}/${entry.slug}`,
                            text: entry.name,
                            hash: credentials[index].hash
                        } as any;
                    }));
                }, []).filter((entry: any) => openProjects.indexOf(entry.value) !== -1);
            });
    }

    chooseFolder() {

        Observable.zip(this.preferences.getOpenFolders(), this.preferences.getExpandedNodes(), (openFolders, expandedNodes) => {
            if (this.defaultFolder) {
                return Observable.of(this.defaultFolder);
            }
            for (let i = 0; i < expandedNodes.length; i++) {
                if (openFolders.indexOf(expandedNodes[i]) !== -1) {
                    return Observable.of(expandedNodes[i]);
                }
            }
            return Observable.of(null);
        }).take(1).subscribe(folder => {
            const path = folder || app.getPath("home");

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
            this.dataGateway.invalidateFolderListing(folder);
            this.modal.close();
            this.workbox.getOrCreateFileTab(filename).subscribe(tab => {
                this.workbox.openTab(tab);
            });
        }, err => {
            this.error = err;
        });
    }

    createRemote() {
        const slug  = this.remoteSlugControl.value;
        const label = this.remoteNameControl.value;
        const app   = AppGeneratorService.generate(this.cwlVersion, this.appType, slug, label);

        const [hash, owner, project] = this.projectSelection.value.split("/");

        const platform = this.apiGateway.forHash(hash);

        const call = platform ? platform.createApp(owner, project, slug, app)
            : Observable.throw(
                new Error("You cannot create the app because you are not connected to the necessary platform."));

        call.subscribe(data => {
            this.dataGateway.invalidateProjectListing(hash, owner, project);
            this.workbox.getOrCreateFileTab([hash, owner, project, owner, project, slug, 0].join("/")).subscribe(tab => {
                this.workbox.openTab(tab);
            });
            this.modal.close();
        }, err => {
            this.error = err;
        });
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

    chosenPath() {
        return this.defaultFolder ? this.localFileControl.valid ?
            this.defaultFolder + this.chosenLocalFilename :
            this.defaultFolder : this.chosenLocalFilename;
    }

    isLocalButtonDisabled() {
        return (this.defaultFolder && this.localFileControl.invalid) ||
            (!this.defaultFolder && this.localNameControl.invalid) ||
            !this.chosenLocalFilename;
    }

    ngOnInit() {
        if (this.appType) {
            this.appTypeLocked = true;
        }

        this.localFileControl  = new FormControl("",
            [Validators.required, Validators.pattern('^[a-zA-Zа-яА-Я0-9_!-]+$')],
            [this.hasLocalFileAsyncValidator.bind(this)]);

        this.projectSelection = new FormControl(this.defaultProject || "", [Validators.required]);

        this.platformGroup = new FormGroup({
            name: this.remoteSlugControl,
            project: this.projectSelection,
        });

        this.tracked = this.platformGroup.valueChanges.subscribe(change => {

            this.platformGroup.setErrors({});

        });

        this.tracked = this.platformGroup.valueChanges
            .debounceTime(300)
            .filter(val => this.platformGroup.get("name").valid && this.platformGroup.get("project").valid)
            .do(() => this.checkingSlug = true)
            .switchMap((values: { name: string, project: string }) => {
                const {name, project}    = values;
                const [hash, owner, app] = project.split("/");
                const slug               = this.slugify.transform(name);
                const platform           = this.apiGateway.forHash(hash);

                return platform ? platform.suggestSlug(owner, app, slug)
                    : Observable.throw(
                        new Error("Cannot suggest slug because you are not connected to the necessary platform."));
            })
            .subscribe(data => {
                this.remoteSlugControl.setValue(data.app_name, {
                    emitEvent: false
                });
                this.checkingSlug = false;
            });

        this.tracked = this.localFileControl.valueChanges
            .debounceTime(300)
            .subscribe(val => {
                this.chosenLocalFilename = val ? val + ".cwl" : "";
            });
    }
}
