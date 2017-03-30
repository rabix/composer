import {ChangeDetectorRef, Component, Input} from "@angular/core";
import {UserPreferencesService} from "../../../services/storage/user-preferences.service";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {DataGatewayService} from "../../data-gateway/data-gateway.service";
import {SlugifyPipe} from "../../../../../node_modules/ngx-pipes/src/app/pipes/string/slugify";
import {FormControl, Validators, FormGroup} from "@angular/forms";
import {AuthService} from "../../../auth/auth/auth.service";
import {PlatformAPIGatewayService} from "../../../auth/api/platform-api-gateway.service";
import {AppGeneratorService} from "../../../cwl/app-generator/app-generator.service";
const {app, dialog} = window["require"]("electron").remote;
import * as YAML from "js-yaml";
import {WorkboxService} from "../../workbox/workbox.service";
import {Observable} from "rxjs/Observable";
import {PlatformAppEntry} from "../../../services/api/platforms/platform-api.types";

@Component({
    selector: "ct-publish-modal",
    providers: [SlugifyPipe],
    template: `
        <div class="p-1">

            <div class="form-group">
                <label class="">App Name:</label>
                <input class="form-control" [formControl]="remoteNameControl"/>

                <p *ngIf="remoteNameControl.value" class="form-text text-muted">
                    App ID: {{ remoteSlugControl.value }}
                </p>
            </div>

            <div class="form-group" *ngIf="info">
                <label class="">Revision Note:</label>
                <input class="form-control" [formControl]="revisionNote"/>
            </div>


            <div class="form-group">
                <label>Destination Project:</label>
                <ct-auto-complete [formControl]="projectSelection"
                                  [mono]="true"
                                  [options]="projectOptions"
                                  [optgroups]="platformOptgroups"
                                  placeholder="Choose a destination project..."
                                  optgroupField="hash"></ct-auto-complete>
            </div>

            <div class="alert alert-info" *ngIf="info" [innerHTML]="info"></div>
            <div class="alert alert-danger" *ngIf="error">{{ error }}</div>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="modal.close()"> Cancel</button>
                <button type="button"
                        (click)="publish()"
                        class="btn btn-success"
                        [disabled]="platformGroup.invalid">
                    <span *ngIf="checking">Checking...</span>
                    <span *ngIf="!checking">Create</span>
                </button>
            </div>
        </div>
    `,
    styleUrls: ["./publish-modal.component.scss"],
})
export class PublishModalComponent extends DirectiveBase {

    @Input()
    appContent: object;

    revisionNote: FormControl;
    platformGroup: FormGroup;
    projectSelection: FormControl;
    remoteNameControl: FormControl;
    remoteSlugControl: FormControl;
    error: string;
    info: string;
    originalApp: PlatformAppEntry;
    projectOptions    = [];
    platformOptgroups = [];
    checking          = false;

    constructor(private dataGateway: DataGatewayService,
                private modal: ModalService,
                private slugify: SlugifyPipe,
                private apiGateway: PlatformAPIGatewayService,
                private workbox: WorkboxService,
                private preferences: UserPreferencesService) {

        super();

        this.remoteNameControl = new FormControl("", [Validators.required]);
        this.remoteSlugControl = new FormControl("", [Validators.required]);
        this.projectSelection  = new FormControl("", [Validators.required]);
        this.revisionNote      = new FormControl("");

        this.remoteNameControl.valueChanges
            .map(value => this.slugify.transform(value))
            .subscribe(val => this.remoteSlugControl.setValue(val));

        this.platformGroup = new FormGroup({
            name: this.remoteSlugControl,
            project: this.projectSelection,
            revisionNote: this.revisionNote
        });

        this.tracked = this.platformGroup.valueChanges.subscribe(change => {

            this.platformGroup.setErrors({});

        });

        this.tracked = this.platformGroup.valueChanges
            .debounceTime(300)
            .filter(val => this.platformGroup.get("name").valid && this.platformGroup.get("project").valid)
            .do(() => {
                this.checking = true;
                this.error    = undefined;
                this.info     = undefined;
            })
            .switchMap((values: { name: string, project: string }) => {
                const {name, project}    = values;
                const [hash, owner, app] = project.split("/");
                const slug               = this.slugify.transform(name);

                return this.apiGateway.forHash(hash).getApp(owner, app, slug).catch(err => {
                    if (err.status === 404) {
                        return Observable.of(null);
                    } else {
                        throw err;
                    }
                });
            })
            .subscribe((data: PlatformAppEntry) => {
                this.checking = false;
                this.platformGroup.setErrors(null);
                this.originalApp = data;
                if (data) {
                    const nextRevision = ~~data["sbg:latestRevision"] + 1;
                    this.info          =
                        "An app by this slug already exists in the selected project.<br/>" +
                        `Publishing will create a revision <strong>${nextRevision}</strong>`;
                }
            }, err => {
                this.error = err;
            });

        this.tracked = this.dataGateway.getProjectsForAllConnections().withLatestFrom(
            this.preferences.getOpenProjects(),
            (data, openProjects) => ({...data, openProjects}))
            .subscribe(data => {

                const {credentials, listings, openProjects} = data;

                this.platformOptgroups = credentials.map(creds => ({value: creds.hash, label: creds.profile}));
                this.projectOptions    = listings.reduce((acc, listing, index) => {

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

    publish() {
        const slug         = this.remoteSlugControl.value;
        const label        = this.remoteNameControl.value;
        const revisionNote = this.revisionNote.value;
        const content      = this.appContent;

        const [hash, owner, project] = this.projectSelection.value.split("/");

        let call;
        content["label"] = label;
        if (this.originalApp) {
            content["sbg:id"] = this.originalApp["sbg:id"];

            call = this.apiGateway.forHash(hash).saveApp(content as any, revisionNote);
        } else {
            content["sbg:id"] = [owner, project, slug, 0].join("/");

            call = this.apiGateway.forHash(hash).createApp(owner, project, slug, content as any);
        }

        call.subscribe(app => {
            this.dataGateway.invalidateProjectListing(hash, owner, project);
            this.workbox.getOrCreateFileTab([hash, owner, project, owner, project, slug].join("/")).subscribe(tab => {
                this.workbox.openTab(tab);
            });
            this.modal.close();
        }, err => {
            this.error = err;
        });
    }
}
