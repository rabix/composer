import {
    Component,
    EventEmitter,
    Input,
    Output,
    ViewEncapsulation,
    OnInit,
    OnChanges
} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import {Observable} from "rxjs/Observable";

interface CWLFile {
    path?: string;
    size?: number;
    basename?: string;
    nameext?: string;
    nameroot?: string;
    contents?: string;
    metadata?: {};
    secondaryFiles?: [{ path?: string }];
}

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-file-input-inspector",
    template: `
        <form [formGroup]="formGroup">
            <!--Path-->
            <div class="form-group">
                <label>Path</label>
                <input class="form-control" formControlName="path"/>
            </div>

            <!--Size-->
            <div class="form-group">
                <label>Size</label>
                <input class="form-control" formControlName="size"/>
            </div>

            <!--Secondary Files-->
            <div class="form-group">
                <label>Secondary Files</label>
                <ct-compact-list [addKeyCode]="13"
                                 formControlName="secondaryFiles"></ct-compact-list>
            </div>

            <!--Metadata-->
            <div class="form-group">
                <label>Metadata</label>
                <ct-map-list formControlName="metadata"></ct-map-list>
            </div>

            <!--Content-->
            <div class="form-group">
                <label>Content</label>
                <textarea rows="10" class="form-control" formControlName="contents"></textarea>
            </div>
            
            <!--Basename-->
            <div class="form-group" *ngIf="formGroup.controls['basename']">
                <label>Basename</label>
                <input class="form-control" formControlName="basename"/>
            </div>

            <!--Nameroot-->
            <div class="form-group" *ngIf="formGroup.controls['nameroot']">
                <label>Nameroot</label>
                <input class="form-control" formControlName="nameroot"/>
            </div>

            <!--Nameext-->
            <div class="form-group" *ngIf="formGroup.controls['nameext']">
                <label>Nameext</label>
                <input class="form-control" formControlName="nameext"/>
            </div>
        </form>
    `
})
export class FileInputInspectorComponent implements OnInit, OnChanges {

    /** Input data for the component */
    @Input()
    public input: CWLFile = {};

    /** Emits when the form data changed */
    @Output()
    public update = new EventEmitter();

    /** Paths that will be displayed as tags in the compact list component */
    public secondaryFilePaths: string[] = [];

    /** Form group that holds all the data */
    public formGroup: FormGroup;

    ngOnInit() {
        const controls = {
            path: new FormControl(this.input.path),
            size: new FormControl(this.input.size),
            secondaryFiles: new FormControl(this.secondaryFilePaths),
            contents: new FormControl(this.input.contents),
            metadata: new FormControl(this.input.metadata)
        };

        // Add v1.0 properties to controls only if they are defined on the input
        if (this.input.basename !== undefined) {
            controls["basename"] = new FormControl(this.input.basename);
        }

        if (this.input.nameext !== undefined) {
            controls["nameext"] = new FormControl(this.input.nameext);
        }

        if (this.input.nameroot !== undefined) {
            controls["nameroot"] = new FormControl(this.input.nameroot);
        }

        this.formGroup = new FormGroup(controls);

        // We need to combine changes from two different sources
        Observable.merge(
            // Watch for changes of values on the secondaryFiles tag array
            this.formGroup.get("secondaryFiles").valueChanges

            // We need to compare arrays in order not to feed an array with the same content
            // back into the loop. This works since elements are plain strings.
                .distinctUntilChanged((a, b) => a.toString() === b.toString()),

            this.formGroup.valueChanges.debounceTime(300)
        )

            .distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))

            // Take the plain form values
            .map(() => this.formGroup.getRawValue())

            // Merge plain form values with the secondaryFiles values map onto their original structure
            .map(val => ({...val, secondaryFiles: val.secondaryFiles.map(path => ({path}))}))

            // Then emit gathered data as an update from the component
            .subscribe(data => {
                this.update.emit(data);
            });
    }

    ngOnChanges() {

        if (!this.input) {
            return;
        }
        // secondaryFiles is an array of files/directories, we just need their paths
        this.secondaryFilePaths = (this.input.secondaryFiles as { path: string }[] || []).map(v => v.path);

        // Form group is not present on first call
        if (this.formGroup) {
            this.formGroup.get("secondaryFiles").setValue(this.secondaryFilePaths);
        }
    }
}
