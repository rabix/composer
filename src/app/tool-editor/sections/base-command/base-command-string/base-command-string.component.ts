import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import {DirectiveBase} from "../../../../util/directive-base/directive-base";

@Component({
    selector: "ct-base-command-string",
    template: `
        <form [formGroup]="form" data-test="base-command-form" (ngSubmit)="sendUpdate(form.value)">
            <input class="form-control"
                   (blur)="sendUpdate(form.value)"
                   data-test="base-command-string"
                   [formControl]="form.controls['baseCommand']"
                   [readonly]="readonly"/>
        </form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseCommandStringComponent extends DirectiveBase implements OnChanges {

    @Input()
    baseCommand: string[] = [];

    @Input()
    readonly = false;

    @Output()
    update = new EventEmitter<string[]>();

    form = new FormGroup({baseCommand: new FormControl("")});

    constructor() {
        super();
    }

    sendUpdate(value) {
        this.update.emit(value.baseCommand.split(" "));
    }

    ngOnChanges(): void {
        this.form.controls["baseCommand"].setValue(this.baseCommand.join(" "), {onlySelf: true});
    }
}
