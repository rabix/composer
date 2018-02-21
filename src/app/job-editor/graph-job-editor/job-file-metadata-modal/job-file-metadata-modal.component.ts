import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {FormArray, FormControl, FormGroup} from "@angular/forms";
import {ModalService} from "../../../ui/modal/modal.service";

@Component({
    selector: "ct-job-file-metadata-modal",
    template: `
        <form [formGroup]="form" (ngSubmit)="form.valid && applyChanges()">

            <div class="form-container p-2">
                <div class="form-group ">
                    <label>Secondary files</label>

                    <div *ngFor="let group of form.get('secondaryFiles')['controls']; let idx = index" class="mb-1 secondary-file-row">

                        <ct-native-file-browser-form-field class="input-group secondary-file-input"
                                                           [formControl]="group.get('path')"
                                                           [useIcon]="true"
                                                           [relativePathRoot]="relativePathRoot"
                                                           [browseIcon]="group.get('class').value === 'File' ? 'fa-file' : 'fa-folder'"
                                                           [selectionType]="group.get('class').value === 'File' ? 'file' : 'directory'">
                        </ct-native-file-browser-form-field>

                        <span class="delete-btn-group">
                            <button type="button" class="btn array-remove-btn btn-unstyled" (click)="deleteSecondaryFile(idx)"
                                    [disabled]="readonly">
                                <i class="fa fa-trash"></i>
                            </button>
                        </span>
                    </div>
                    <p>
                        <button type="button" class="btn pl-0 pr-0 btn-link no-outline no-underline-hover"
                                (click)="addSecondaryFile('', 'File')">
                            <i class="fa fa-plus"></i> Add a file
                        </button>

                        <ng-container *ngIf="allowDirectories">
                            or
                            <button type="button" class="btn pl-0 btn-link no-outline no-underline-hover"
                                    (click)="addSecondaryFile('', 'Directory')">
                                a directory
                            </button>
                        </ng-container>
                    </p>
                </div>

                <div class="form-group">
                    <label>Metadata</label>
                    <ct-map-list class="form-group" formControlName="metadata"></ct-map-list>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn btn-secondary" type="button" (click)="close()" data-test="modal-cancel-btn">Cancel</button>
                <button class="btn btn-primary" type="submit" data-test="modal-submit-btn" [disabled]="!form.valid">Done</button>
            </div>

        </form>
    `,
    styleUrls: ["./job-file-metadata-modal.component.scss"],
})
export class JobFileMetadataModalComponent implements OnInit {

    @Input()
    secondaryFiles: { class: "File" | "Directory", path: string }[] = [];

    @Input()
    metadata: Object;

    @Output()
    submit = new EventEmitter<Object>();

    @Input()
    allowDirectories = true;

    @Input()
    relativePathRoot: string;

    form: FormGroup;

    constructor(private modal: ModalService) {
    }

    ngOnInit() {

        this.form = new FormGroup({
            secondaryFiles: new FormArray([]),
            metadata: new FormControl(this.metadata)
        });

        try {
            for (const entry of this.secondaryFiles) {
                const formArray = (this.form.get("secondaryFiles") as FormArray);
                formArray.push(new FormGroup({
                    class: new FormControl(entry.class),
                    path: new FormControl(entry.path)
                }));
            }
        } catch (ex) {
            console.warn("Invalid secondary files format", this.secondaryFiles);
        }
    }

    deleteSecondaryFile(index: number) {
        const ctrl = this.form.get("secondaryFiles") as FormArray;
        ctrl.removeAt(index);
    }

    addSecondaryFile(path = "", type: "File" | "Directory") {
        const ctrl = this.form.get("secondaryFiles") as FormArray;

        ctrl.push(new FormGroup({
            class: new FormControl(type),
            path: new FormControl(path)
        }));
    }

    applyChanges() {
        const fVal = this.form.value;

        fVal.secondaryFiles = fVal.secondaryFiles.filter(entry => entry.path.trim() !== "");

        this.submit.next(fVal);
    }

    close() {
        this.modal.close();
    }

}
