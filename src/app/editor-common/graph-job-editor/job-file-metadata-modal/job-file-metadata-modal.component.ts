import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {FormArray, FormControl, FormGroup} from "@angular/forms";
import {ModalService} from "../../../ui/modal/modal.service";

/**
 * @TODO: files can also be directories and need to be specified \as CWL file objects ({class: "File" | "Directory"})
 * @TODO: for each entry, check whether it's a file or a dir on the system
 */
@Component({
    selector: "ct-job-file-metadata-modal",
    template: `
        <form [formGroup]="form" (ngSubmit)="form.valid && applyChanges()">
            
            <div class="form-container p-2">
                <div class="form-group ">
                    <label>Secondary files</label>

                    <div *ngFor="let control of form.get('secondaryFiles')['controls']; let idx = i" class="mb-1 secondary-file-row">
                        <ct-native-file-browser-form-field class="input-group secondary-file-input"
                                                           [formControl]="control"
                                                           [useIcon]="true"
                                                           selectionType="file">
                        </ct-native-file-browser-form-field>
                        <span class="delete-btn-group">
                        <button type="button" class="btn array-remove-btn btn-unstyled" (click)="deleteSecondaryFile(idx)"
                                [disabled]="readonly">
                            <i class="fa fa-trash"></i>
                        </button>
                    </span>
                    </div>
                    <p>
                        <button type="button" class="btn pl-0 btn-link no-outline no-underline-hover" (click)="addSecondaryFile()">
                            <i class="fa fa-plus"></i> Add secondary file
                        </button>
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
    secondaryFiles = <string[]>[];

    @Input()
    metadata: Object;

    @Output()
    submit = new EventEmitter<Object>();

    form: FormGroup;

    constructor(private modal: ModalService) {
    }

    ngOnInit() {


        this.form = new FormGroup({
            secondaryFiles: new FormArray([]),
            metadata: new FormControl(this.metadata)
        });

        for (const filePath of this.secondaryFiles) {
            (this.form.get("secondaryFiles") as FormArray).push(new FormControl(filePath));
        }
    }

    deleteSecondaryFile(index: number) {
        const ctrl = this.form.get("secondaryFiles") as FormArray;
        ctrl.removeAt(index);
    }

    addSecondaryFile(path = "") {
        const ctrl = this.form.get("secondaryFiles") as FormArray;
        ctrl.push(new FormControl(path));
    }

    applyChanges() {
        this.submit.next(this.form.value);
    }

    close() {
        this.modal.close();
    }

}
