import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {Component, ViewChild} from "@angular/core";
import {EventHubService} from "../../services/event-hub/event-hub.service";
import {FileName} from "../forms/models/file-name";
import {NgStyle, ControlGroup} from "@angular/common";
import {RadioButtonComponent} from "../forms/elements/radio-button.component";
import {RadioGroupComponent, GroupItem} from "../forms/elements/radio-group.component";
import {Validators, REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES, FormBuilder, FormGroup} from "@angular/forms";
import {CreateFileRequestAction} from "../../action-events/index";
import {AlertComponent} from "./alert.component";
import {InputComponent} from "../forms/elements/input.component";
import {Observable, Subscription} from "rxjs";
import {ModalService} from "../modal";
import {CwlFileTemplate, CwlFileTemplateType} from "../../types/file-template.type";

@Component({
    selector: 'new-file-modal',
    directives: [
        BlockLoaderComponent,
        NgStyle,
        RadioButtonComponent,
        RadioGroupComponent,
        AlertComponent,
        InputComponent,
        REACTIVE_FORM_DIRECTIVES,
        FORM_DIRECTIVES,
    ],
    template: `
        <block-loader class="overlay" *ngIf="isCreatingFile"></block-loader>
        <div>
            <form (ngSubmit)="onSubmit(newFileForm)" [formGroup]="newFileForm" class="flex-form">
                <div class="modal-body">
                    <ct-radio-group #tpl class="flex-container" [items]="fileTypes"></ct-radio-group>
                    <br/>
                    <ct-input [name]="'File Name'"
                              [autofocus]="true" 
                              [placeholder]="'ex. my-workflow.json'" 
                              [control]="newFileForm.controls['filename']">
                    </ct-input>
                    
                    <div *ngIf="showCwlExtrasForm" [formGroup]="cwlExtrasForm">
                        <ct-input [name]="'Label'" [control]="cwlExtrasForm.controls['label']"></ct-input>
                        <ct-input [name]="'Description'" [control]="cwlExtrasForm.controls['description']"></ct-input>
                    </div>
                    
                    <ct-alert *ngIf="error" [type]="'danger'">{{ error.message }}</ct-alert>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary btn-sm" type="button" (click)="onCancel()">Cancel</button>
                    <button class="btn btn-primary btn-sm" type="submit" [disabled]="!newFileForm.valid">Create</button>
                </div>
        
            </form>
        </div>
`
})
export class NewFileModalComponent {

    /** Base directory path prefix for newly created file */
    public basePath: string;

    /** Switch for showing the cog overlay, is active between submitting the form and the API response */
    private isCreatingFile: boolean;

    /** Error object that we will show below the form */
    private error: {[message: string]: string};

    /** Base form for the new file creation */
    private newFileForm: FormGroup;

    /** Subform that is applicable only to the Workflow and CLT file types */
    private cwlExtrasForm: FormGroup;

    /** Whether the CWLExtras form should be shown */
    private showCwlExtrasForm: boolean;

    /** List of file templates */
    private fileTypes: GroupItem<string>[];

    /** File Template group switch component */
    @ViewChild(RadioGroupComponent)
    private fileTypeRadio: RadioGroupComponent<CwlFileTemplateType>;

    /** Subscriptions that should be disposed upon destroying the component */
    private subs: Subscription[];

    constructor(private formBuilder: FormBuilder,
                private eventHub: EventHubService,
                private modal: ModalService) {

        this.showCwlExtrasForm = false;
        this.subs              = [];
        this.basePath          = "";

        this.fileTypes = [
            {name: "Blank File", value: "blank", icon: "file-text-o", selected: true},
            {name: "Command Line Tool", value: "command_line_tool", icon: "terminal"},
            {name: "Workflow", value: "workflow", icon: "share-alt"},
        ];

        this.newFileForm = formBuilder.group({
            filename: ["", Validators.compose([Validators.required, Validators.minLength(1)])]
        });

        this.cwlExtrasForm = formBuilder.group({
            label: [""],
            description: [""]
        });

        this.subs.push(this.newFileForm.valueChanges.subscribe(_ => this.error = undefined));
    }

    private onSubmit(form: ControlGroup) {

        // If the overlay is shown right away, user working locally would just see
        // flashing darkening over the modal, so avoid that, but keep the delay low enough
        // so it does show perceivably instantly
        Observable.of(1).delay(50).filter(_ => this.error === undefined).subscribe(_ => this.isCreatingFile = true);

        const fileType = this.fileTypeRadio.getSelectedValue();
        let fileName   = new FileName(form.controls["filename"].value);

        if (fileType === "workflow" || fileType === "command_line_tool") {
            fileName = fileName.ensureExtension("json");
        }

        const path = this.basePath.length ? `${this.basePath}/${fileName.fullPath}` : fileName.fullPath;

        // Currently all files will be created for draft-2 until we make a switch button and v1 templates
        const template = new CwlFileTemplate(fileType, "draft-2", this.cwlExtrasForm.value);
        const action   = new CreateFileRequestAction({path, template});

        this.eventHub.publish(action).getResponse().subscribe(_ => {
            this.modal.close();
        }, (err) => {
            this.error          = err;
            this.isCreatingFile = false;
        });
    }

    public onCancel() {
        this.modal.close();
    }

    private ngAfterViewInit() {
        this.subs.push(this.fileTypeRadio.value.subscribe(val => {
            this.showCwlExtrasForm = val !== "blank";
        }));
    }

    private ngOnDestroy() {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
