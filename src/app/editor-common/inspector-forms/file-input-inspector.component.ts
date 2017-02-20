import {
    Component, Input, SimpleChanges, Output, EventEmitter,
    ChangeDetectionStrategy, ChangeDetectorRef
} from "@angular/core";
import {FormGroup, FormControl, FormArray} from "@angular/forms";
import {Observable, Subject} from "rxjs";

interface CWLFile {
    path?: string;
    size?: number;
    contents?: string;
    metadata?: {};
    secondaryFiles?: [{ path?: string }];
}

@Component({
    selector: "ct-file-input-inspector",
    // changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <form [formGroup]="formGroup">
            <!--Path-->
            <div class="form-group">
                <label>Path</label>
                <input class="form-control" formControlName="path" [value]="input.path || ''"/>
            </div>
            
            <!--Size-->
            <div class="form-group">
                <label>Size</label>
                <input class="form-control" formControlName="size" [value]="input.size || 0"/>
            </div>
            
            <!--Secondary Files-->
            <div class="form-group">
                <label>Secondary Files</label>
                <compact-list [addKeyCode]="13" formControlName="secondaryFiles"></compact-list>
            </div>
            
            <div class="form-group">
                <label>Metadata</label>
                <ct-map-list formControlName="metadata"></ct-map-list>
            </div>
            
            <!--Content-->
            <div class="form-group">
                <label>Content</label>
                <textarea rows="10" class="form-control"  formControlName="contents" [value]="input.contents || ''"></textarea>
            </div>
        </form>
    `
})
export class FileInputInspector {

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

        this.formGroup = new FormGroup({
            path: new FormControl(this.input.path),
            size: new FormControl(this.input.size),
            secondaryFiles: new FormControl(this.secondaryFilePaths),
            contents: new FormControl(this.input.contents),
            metadata: new FormControl(this.input.metadata)
        });

        // We need to combine changes from two different sources
        Observable.merge(
            // Watch for changes of values on the secondaryFiles tag array
            this.formGroup.get("secondaryFiles").valueChanges

            // We need to compare arrays in order not to feed an array with the same content
            // back into the loop. This works since elements are plain strings.
                .distinctUntilChanged((a, b) => a.toString() === b.toString()),

            this.formGroup.valueChanges.debounceTime(300)
        )

            .distinctUntilChanged((a,b) => JSON.stringify(a) === JSON.stringify(b))

            // Take the plain form values
            .map(() => this.formGroup.getRawValue())

            // Merge plain form values with the se condaryFiles values map onto their original structure
            .map(val => ({...val, secondaryFiles: val.secondaryFiles.map(path => ({path}))}))

            // Then emit gathered data as an update from the component
            .subscribe(data => {
                this.update.emit(data);
            });
    }

    ngOnChanges(changes: SimpleChanges) {

        if(!this.input){
            return;
        }
        // secondaryFiles is an array of files/directories, we just need their paths
        this.secondaryFilePaths = (this.input.secondaryFiles || []).map(v => v.path);

        // Form group is not present on first call
        if (this.formGroup) {
            this.formGroup.get("secondaryFiles").setValue(this.secondaryFilePaths);
        }
    }
}
