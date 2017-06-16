import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";

@Component({
    selector: "ct-directory-input-inspector",
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
                <ct-compact-list [addKeyCode]="13"
                                 formControlName="secondaryFiles"></ct-compact-list>
            </div>

            <div class="form-group">
                <label>Metadata</label>
                <ct-map-list formControlName="metadata"></ct-map-list>
            </div>

            <!--Content-->
            <div class="form-group">
                <label>Content</label>
                <textarea rows="10" class="form-control" formControlName="contents"
                          [value]="input.contents || ''"></textarea>
            </div>
        </form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DirectoryInputInspectorComponent implements OnInit {
    /** Input data for the component */
    @Input()
    public input: any = {};

    /** Emits when the form data changed */
    @Output()
    public update = new EventEmitter();

    formGroup: FormGroup;

    ngOnInit(): void {

        this.formGroup = new FormGroup({
            path: new FormControl(this.input.path),
            contents: new FormControl(this.input.contents),
            metadata: new FormControl(this.input.metadata)
        });

    }
}
