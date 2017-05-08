import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {ExpressionModel} from "cwlts/models";
import {FormControl} from "@angular/forms";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {Observable} from "rxjs/Observable";

@Component({
    selector: 'ct-streams',
    template: `
        <form class="streams-row">
            <div class="stream">
                <label class="form-control-label">Stdin redirect</label>
                <ct-expression-input
                        [formControl]="stdinControl"
                        data-test="stdin-input"
                        [context]="context"
                        [readonly]="readonly">
                </ct-expression-input>
            </div>
            <div class="stream">
                <label class="form-control-label">Stdout redirect</label>
                <ct-expression-input
                        [formControl]="stdoutControl"
                        data-test="stdout-input"
                        [context]="context"
                        [readonly]="readonly">
                </ct-expression-input>
            </div>
        </form>
    `,
    styleUrls: ['./streams.component.scss']
})
export class StreamsComponent extends DirectiveBase implements OnChanges {

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

    stdinControl  = new FormControl();
    stdoutControl = new FormControl();

    ngOnInit(): void {
        this.tracked = Observable
            .merge(this.stdinControl.valueChanges, this.stdoutControl.valueChanges)
            .subscribe(() => {
                this.update.emit({
                    stdin: this.stdinControl.value,
                    stdout: this.stdoutControl.value
                });
            });
    }

    ngOnChanges(): void {
        console.log("setting update");
        if (this.stdinControl && this.stdin !== this.stdinControl.value) {
            console.log("updating value");
            this.stdinControl.setValue(this.stdin, {onlySelf: true});
        }

        if (this.stdoutControl && this.stdout !== this.stdoutControl.value) {
            this.stdoutControl.setValue(this.stdout, {onlySelf: true});
        }
    }
}
