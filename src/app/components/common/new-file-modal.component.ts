import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {Component, ViewChild} from "@angular/core";
import {EventHubService} from "../../services/event-hub/event-hub.service";
import {FileName} from "../forms/models/file-name";
import {NgStyle, ControlGroup, FormBuilder} from "@angular/common";
import {RadioButtonComponent} from "../forms/elements/radio-button.component";
import {RadioGroupComponent} from "../forms/elements/radio-group.component";
import {Validators, REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES} from "@angular/forms";
import {FileModel} from "../../store/models/fs.models";
import {CreateFileRequestAction} from "../../action-events/index";
import {AlertComponent} from "./alert.component";
import {InputComponent} from "../forms/elements/input.component";
import {Observable} from "rxjs";
import {ModalService} from "../modal";

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
                    <ct-radio-group class="flex-container" [items]="fileTypes"></ct-radio-group>
                    <br/>
                    <ct-input [name]="'File Name'"
                              [autofocus]="true" 
                              [placeholder]="'ex. my-workflow.json'" 
                              [control]="newFileForm.controls['name']">
                    </ct-input>
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
    private isCreatingFile: boolean;
    private error: {[message: string]: string};

    private newFileForm: ControlGroup;
    private fileTypes: any[];

    @ViewChild(RadioGroupComponent)
    private fileTypeRadio: RadioGroupComponent;

    constructor(private formBuilder: FormBuilder,
                private eventHub: EventHubService,
                private modal: ModalService) {

        this.fileTypes = [
            {name: "Blank File", value: "blank", icon: "file-text-o", selected: true},
            {name: "Command Line Tool", value: "command_line_tool", icon: "terminal"},
            {name: "Workflow", value: "workflow", icon: "share-alt"},
            {name: "JS Expression", value: "js_expression", icon: "code"},
        ];

        this.newFileForm = formBuilder.group({
            name: ["", Validators.compose([Validators.required, Validators.minLength(1)])]
        });

        this.newFileForm.valueChanges.subscribe(_ => this.error = undefined);
    }

    private onSubmit(form: ControlGroup) {

        // If the overlay is shown right away, user working locally would just see
        // flashing darkening over the modal, so avoid that, but keep the delay low enough
        // so it does show perceivably instantly
        Observable.of(1).delay(50).filter(_ => this.error === undefined).subscribe(_ => this.isCreatingFile = true);

        const fileType = this.fileTypeRadio.getSelectedValue();

        let fileName = new FileName(form.controls["name"].value);

        if (fileType !== "blank" && !fileName.hasExtension()) {
            fileName = fileName.withExtension("json");
        }

        const file = FileModel.fromPath(fileName);
        this.eventHub
            .publish(new CreateFileRequestAction(file))
            .getResponse()
            .first()
            .subscribe(_ => {
                this.modal.close();
            }, (err) => {
                this.error          = err;
                this.isCreatingFile = false;
            });
    }

    public onCancel() {
        this.modal.close();
    }
}
