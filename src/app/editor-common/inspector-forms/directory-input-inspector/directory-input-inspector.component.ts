import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, OnChanges} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";

@Component({
    selector: "ct-directory-input-inspector",
    template: `
        <form [formGroup]="formGroup">
            <!--Path-->
            <div class="form-group">
                <label>Path</label>
                <input class="form-control" formControlName="path"/>
            </div>

            <!--Basename-->
            <div class="form-group">
                <label>Basename</label>
                <input class="form-control" formControlName="basename"/>
            </div>
        </form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DirectoryInputInspectorComponent implements OnInit, OnChanges {
    /** Input data for the component */
    @Input()
    public input: any = {};

    /** Emits when the form data changed */
    @Output()
    public update = new EventEmitter();

    @Input()
    public path: string;

    formGroup: FormGroup;

    ngOnInit(): void {

        this.formGroup = new FormGroup({
            path: new FormControl(this.input.path || ""),
            basename: new FormControl(this.input.basename || ""),
        });

        this.formGroup.valueChanges.subscribe(data => {
            this.update.emit(data);
        });
    }

    ngOnChanges() {

        if (!this.input) {
            return;
        }

        // Form group is not present on first call
        if (this.formGroup) {
            this.formGroup.get("path").setValue(this.path, {onlySelf: true});
        }
    }
}
