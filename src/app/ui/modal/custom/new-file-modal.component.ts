import {Component, Input, ViewChild, ViewEncapsulation} from "@angular/core";
import {CwlFileTemplate, CwlFileTemplateType} from "../../../types/file-template.type";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ModalService} from "../modal.service";
import {Observable} from "rxjs";
import {TemplateProviderService} from "../../../services/template-provider.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {GroupItem, RadioGroupComponent} from "../../../core/forms/elements/radio-group.component";
import {FileName} from "../../../core/forms/models/file-name";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-new-file-modal",
    template: `
        <div>
            <ct-block-loader class="overlay" *ngIf="isCreatingFile"></ct-block-loader>
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

                    <div *ngIf="error" class="alert alert-danger form-control-label">
                        {{ error.message }}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary btn-sm" type="button" (click)="onCancel()">Cancel</button>
                    <button class="btn btn-primary btn-sm" type="submit" [disabled]="!newFileForm.valid">Create</button>
                </div>
            </form>
        </div>
    `
})
export class NewFileModalComponent extends DirectiveBase {

    /** Base directory path prefix for newly created file */
    @Input()
    public basePath = "";

    @Input()
    public save: (path: string, content: string) => Observable<any>;

    /** Switch for showing the cog overlay, is active between submitting the form and the API response */
    public isCreatingFile: boolean;

    /** Error object that we will show below the form */
    public error: { [message: string]: string };

    /** Base form for the new file creation */
    public newFileForm: FormGroup;

    /** Subform that is applicable only to the Workflow and CLT file types */
    public cwlExtrasForm: FormGroup;

    /** Whether the CWLExtras form should be shown */
    public showCwlExtrasForm = false;

    /** List of file templates */
    public fileTypes: GroupItem<string>[];

    /** File Template group switch component */
    @ViewChild(RadioGroupComponent)
    private fileTypeRadio: RadioGroupComponent<CwlFileTemplateType>;

    constructor(private formBuilder: FormBuilder,
                private template: TemplateProviderService,
                private modal: ModalService) {

        super();

        this.fileTypes = [
            {name: "Blank File", value: "blank", icon: "file-text-o", selected: true},
            {name: "Command Line Tool", value: "command-line-tool", icon: "terminal"},
            {name: "Workflow", value: "workflow", icon: "share-alt"},
        ];

        this.newFileForm = formBuilder.group({
            filename: ["", Validators.compose([Validators.required, Validators.minLength(1)])]
        });

        this.cwlExtrasForm = formBuilder.group({
            label: [""],
            description: [""]
        });

        this.tracked = this.newFileForm.valueChanges.subscribe(_ => this.error = undefined);
    }

    private onSubmit() {

        // If the overlay is shown right away, user working locally would just see
        // flashing darkening over the modal, so avoid that, but keep the delay low enough
        // so it does show perceivably instantly
        Observable.of(1).delay(50).filter(_ => this.error === undefined).subscribe(_ => this.isCreatingFile = true);

        const fileType = this.fileTypeRadio.getSelectedValue();
        let fileName = new FileName(this.newFileForm.controls["filename"].value);

        if (fileType === "workflow" || fileType === "command_line_tool") {
            fileName = fileName.ensureExtension("json");
        }

        const path = this.basePath.length ? `${this.basePath}/${fileName.fullPath}` : fileName.fullPath;

        // Currently all files will be created for draft-2 until we make a switch button and v1 templates
        const templateParams = new CwlFileTemplate(fileType, "draft-2", this.cwlExtrasForm.value);

        const template = this.template.compile(templateParams.id, templateParams.params);

        this.save(path, template).subscribe(result => {
            this.isCreatingFile = false;
            this.modal.close();
        }, err => {
            this.error = err;
            this.isCreatingFile = false;
        });
    }

    public onCancel() {
        this.modal.close();
    }

    ngAfterViewInit() {
        this.tracked = this.fileTypeRadio.value.subscribe(val => {
            this.showCwlExtrasForm = val !== "blank";
        });

        super.ngAfterViewInit();
    }
}
