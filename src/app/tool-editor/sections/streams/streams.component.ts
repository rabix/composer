import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import {ExpressionModel} from "cwlts/models";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
    selector: "ct-streams",
    template: `
        <div>
            <div class="text-title mb-1">Streams</div>
        </div>

        <form class="streams-row" [formGroup]="form">
            <div class="stream">
                <label class="form-control-label">Stdin redirect</label>
                <ct-expression-input
                        [formControl]="form.controls['stdin']"
                        data-test="stdin-input"
                        [context]="context"
                        [readonly]="readonly">
                </ct-expression-input>
            </div>
            <div class="stream">
                <label class="form-control-label">Stdout redirect</label>
                <ct-expression-input
                        [formControl]="form.controls['stdout']"
                        data-test="stdout-input"
                        [context]="context"
                        [readonly]="readonly">
                </ct-expression-input>
            </div>
        </form>
    `,
    styleUrls: ["./streams.component.scss"]
})
export class StreamsComponent extends DirectiveBase implements OnInit, OnChanges {

    @Input()
    stdin: ExpressionModel;

    @Input()
    stdout: ExpressionModel;

    @Input()
    context: any = {};

    @Input()
    readonly = false;

    @Output()
    update = new EventEmitter<any>();

    form = new FormGroup({
        stdin: new FormControl(),
        stdout: new FormControl()
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
    }
}
