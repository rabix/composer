import {Input, Output, Component} from "@angular/core";
import {Subject} from "rxjs";
import {ComponentBase} from "../../../components/common/component-base";
import {FormGroup, FormControl} from "@angular/forms";
import {FileDefModel} from "cwlts/models/d2sb";
import {FileDef} from "cwlts/mappings/d2sb/FileDef";

@Component({
    selector: 'ct-file-def-inspector',
    template: `<form *ngIf="form">
    <label class="form-control-label">File Name</label>
    <ct-expression-input [formControl]="form.controls['filename']"
                         [context]="context">
    </ct-expression-input>

    <label class="form-control-label">File Content</label>
    <ct-expression-input [formControl]="form.controls['fileContent']"
                         [context]="context">
    </ct-expression-input>
</form>`
})
export class FileDefInspectorComponent extends ComponentBase {

    @Input()
    public fileDef: FileDefModel;

    @Input()
    public context: {$job?: any} = {};

    @Output()
    public save = new Subject<FileDef>();

    private form: FormGroup;

    ngOnInit() {
        this.form = new FormGroup({
            filename: new FormControl(this.fileDef.filename),
            fileContent: new FormControl(this.fileDef.fileContent)
        });

        this.tracked = this.form.valueChanges.subscribe(change => {
            this.save.next({
                filename: change.filename.serialize(),
                fileContent: change.fileContent.serialize()
            });
        });
    }
}