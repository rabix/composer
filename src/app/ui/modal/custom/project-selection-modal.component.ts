import {Component, Input, ViewEncapsulation} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Observable} from "rxjs/Observable";
import {ModalService} from "../modal.service";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-project-selection-modal",
    template: `
        <div>
            <form (ngSubmit)="onSubmit()" [formGroup]="openProjectForm" class="flex-form">
                <div class="modal-body">
                    <div class="input-group project-selection-input-group">
                        <select #projectSelection class="project-selector form-control custom-select"
                                (change)="selectProject(projectSelection.value)" required>
                            <option value="" disabled [selected]="true">Choose a Project...</option>
                            <option *ngFor="let p of (closedProjects | async)" [value]="p.id">{{ p.name }}</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary btn-sm" type="button" (click)="onCancel()">Cancel</button>
                    <button class="btn btn-primary btn-sm" type="submit" [disabled]="!openProjectForm.valid">
                        Open
                    </button>
                </div>
            </form>
        </div>
    `
})
export class ProjectSelectionModal {

    @Input()
    save: (selectedProject: string) => void;

    @Input()
    closedProjects: Observable<string>;

    selectedProject: string;

    /** Base form for open project */
    openProjectForm: FormGroup;

    constructor(private formBuilder: FormBuilder,
                private modal: ModalService) {
        this.openProjectForm = formBuilder.group({});
    }

    selectProject(projectID) {
        this.selectedProject = projectID;
    }

    onSubmit() {
        this.save(this.selectedProject);
    }

    onCancel() {
        this.closeModal();
    }

    closeModal() {
        this.modal.close();
    }
}
