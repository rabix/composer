import {Component, Input, OnInit, Output} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import {DirentModel} from "cwlts/models";
import {Subject} from "rxjs/Subject";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
    styleUrls: ["./file-def-inspector.component.scss"],
    selector: "ct-file-def-inspector",
    template: `
        <form *ngIf="form">
            <div class="form-group file-name">
                <label class="form-control-label">File Name</label>
                <ct-expression-input [formControl]="form.controls['entryName']"
                                     [context]="context"
                                     [readonly]="readonly">
                </ct-expression-input>
            </div>

            <div class="form-group file-content">
                <label class="form-control-label">File Content</label>
                <ct-literal-expression-input [formControl]="form.controls['entry']"
                                             [fileName]="fileName"
                                             [context]="context"
                                             [readonly]="readonly">
                </ct-literal-expression-input>
            </div>
        </form>`
})
export class FileDefInspectorComponent extends DirectiveBase implements OnInit {

    @Input()
    readonly = false;

    @Input()
    dirent: DirentModel;

    @Input()
    context: { $job?: any } = {};

    @Output()
    save = new Subject<{ entryName, entry }>();

    form: FormGroup;

    get fileName(): string {
        const value = this.form.controls["entryName"].value;

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
            entryName: new FormControl(this.dirent.entryName),
            entry: new FormControl(this.dirent.entry)
        });

        this.tracked = this.form.valueChanges.subscribe(change => {
            this.save.next({
                entryName: change.entryName,
                entry: change.entry
            });
        });
    }
}
