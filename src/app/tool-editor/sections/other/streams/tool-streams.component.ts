import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import {CommandLineToolModel, ExpressionModel} from "cwlts/models";
import {DirectiveBase} from "../../../../util/directive-base/directive-base";

@Component({
    selector: "ct-tool-streams",
    template: `
        <form class="streams-row" [formGroup]="form">

            <!--Stdin section-->
            <div class="stream">
                <label class="form-control-label">Stdin redirect</label>
                <ct-expression-input
                    [formControl]="form.controls['stdin']"
                    data-test="stdin-input"
                    [context]="context"
                    [readonly]="readonly">
                </ct-expression-input>
            </div>

            <!--Stdout section-->
            <div class="stream">
                <label class="form-control-label">Stdout redirect</label>
                <ct-expression-input
                    [formControl]="form.controls['stdout']"
                    data-test="stdout-input"
                    [context]="context"
                    [readonly]="readonly">
                </ct-expression-input>
            </div>

            <!--Stderr section-->
            <div class="stream" *ngIf="model.hasStdErr">
                <label class="form-control-label">Stderr redirect</label>
                <ct-expression-input
                    [formControl]="form.controls['stderr']"
                    data-test="stderr-input"
                    [context]="context"
                    [readonly]="readonly">
                </ct-expression-input>
            </div>

        </form>
    `,
    styleUrls: ["./tool-streams.component.scss"]
})
export class ToolStreamsComponent extends DirectiveBase implements OnInit, OnChanges {

    @Input()
    model: CommandLineToolModel;

    @Input()
    stdin: ExpressionModel;

    @Input()
    stdout: ExpressionModel;

    @Input()
    stderr: ExpressionModel;

    @Input()
    context: any = {};

    @Input()
    readonly = false;

    @Output()
    update = new EventEmitter<any>();

    form = new FormGroup({
        stdin: new FormControl(),
        stdout: new FormControl(),
        stderr: new FormControl()
    });

    ngOnInit(): void {

        this.tracked = this.form.valueChanges.subscribe((form) => {
            this.update.emit(form);
        });
    }

    ngOnChanges(): void {

        if (this.stdin !== this.form.get("stdin").value) {
            this.form.get("stdin").setValue(this.stdin, {onlySelf: true});
        }

        if (this.stdout !== this.form.get("stdout").value) {
            this.form.get("stdout").setValue(this.stdout, {onlySelf: true});
        }

        if (this.stderr !== this.form.get("stderr").value) {
            this.form.get("stderr").setValue(this.stderr, {onlySelf: true});
        }

    }
}
