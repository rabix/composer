import {Component, Input, ViewEncapsulation} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ModalService} from "../modal.service";
import {Observable} from "rxjs";

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
    public save: (selectedProject: string) => void;

    @Input()
    public closedProjects: Observable<string>;

    private selectedProject: string;

    /** Base form for open project */
    private openProjectForm: FormGroup;

    constructor(private formBuilder: FormBuilder,
                private modal: ModalService) {
        this.openProjectForm = formBuilder.group({});
    }

    private selectProject(projectID) {
        this.selectedProject = projectID;
    }

    public onSubmit() {
        this.save(this.selectedProject);
    }

    public onCancel() {
        this.closeModal();
    }

    public closeModal() {
        this.modal.close();
    }
}
