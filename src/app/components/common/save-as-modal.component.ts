import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {Component, ViewChild} from "@angular/core";
import {EventHubService} from "../../services/event-hub/event-hub.service";
import {NgStyle, ControlGroup, FormBuilder} from "@angular/common";
import {RadioGroupComponent} from "../forms/elements/radio-group.component";
import {Validators, REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES} from "@angular/forms";
import {AlertComponent} from "./alert.component";
import {InputComponent} from "../forms/elements/input.component";
import {Observable} from "rxjs";
import {WorkspaceService} from "../workspace/workspace.service";
import {CopyFileRequestAction} from "../../action-events/index";
import {ModalService} from "../modal";

@Component({
    selector: 'new-file-modal',
    directives: [
        BlockLoaderComponent,
        NgStyle,
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
                    <ct-input [name]="'File Name'"
                              [autofocus]="true" 
                              [placeholder]="'ex. my-workflow.json'" 
                              [control]="newFileForm.controls['name']">
                    </ct-input>
                    <ct-alert *ngIf="error" [type]="'danger'">{{ error.message }}</ct-alert>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary btn-sm" type="button" (click)="onCancel()">Cancel</button>
                    <button class="btn btn-primary btn-sm" type="submit" [disabled]="!newFileForm.valid">Save</button>
                </div>
        
            </form>
        </div>
`
})
export class SaveAsModalComponent {
    private isCreatingFile: boolean;
    private error: {[message: string]: string};
    private newFileForm: ControlGroup;

    constructor(private formBuilder: FormBuilder,
                private eventHub: EventHubService,
                private workspace: WorkspaceService,
                private modal: ModalService) {

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

        let fileName = form.controls["name"].value;
        this.workspace.selectedFile.switchMap(file => {
            return this.eventHub.publish(new CopyFileRequestAction(file.absolutePath, fileName)).getResponse()
        }).subscribe(_ => {
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
