import {Component, Input, Output, ViewEncapsulation} from "@angular/core";
import {Subject} from "rxjs";
import {ComponentBase} from "../../../components/common/component-base";
import {FormControl, FormGroup} from "@angular/forms";
import {FileDefModel} from "cwlts/models/d2sb";
import {FileDef} from "cwlts/mappings/d2sb/FileDef";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-file-def-inspector",
    template: `
        <form *ngIf="form">
            <div class="form-group file-name">
                <label class="form-control-label">File Name</label>
                <ct-expression-input [formControl]="form.controls['filename']"
                                     [context]="context"
                                     [readonly]="readonly">
                </ct-expression-input>
            </div>

            <div class="form-group file-content">
                <label class="form-control-label">File Content</label>
                <ct-literal-expression-input [formControl]="form.controls['fileContent']"
                                             [fileName]="fileName"
                                             [context]="context"
                                             [readonly]="readonly">
                </ct-literal-expression-input>
            </div>
        </form>`
})
export class FileDefInspectorComponent extends ComponentBase {

    @Input()
    public readonly = false;

    @Input()
    public fileDef: FileDefModel;

    @Input()
    public context: { $job?: any } = {};

    @Output()
    public save = new Subject<FileDef>();

    private form: FormGroup;

    get fileName(): string {
        const value = this.form.controls["filename"].value;

        if (value) {
            if (value.result) {
                return value.result;
            } else if (typeof value.serialize() === "string") {
                return value.serialize();
            }
        }

        return "";
    }

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
