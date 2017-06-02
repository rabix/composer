import {Component, EventEmitter, Input, OnChanges, Output} from "@angular/core";
import {FormGroup} from "@angular/forms";
import {CommandLineToolModel, ExpressionModel} from "cwlts/models";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
    selector: "ct-base-command",
    styleUrls: ["./base-command.component.scss"],
    template: `
        <ct-form-panel>
            <div class="tc-header">
                Base Command
            </div>
            <div class="tc-body">
                <ct-base-command-list [baseCommand]="baseCommand"
                                      *ngIf="version === 'sbg:draft-2'"
                                      [context]="context"
                                      [readonly]="readonly"
                                      [model]="model"
                                      (update)="updateCmd.emit($event)">
                </ct-base-command-list>

                <ct-base-command-string [baseCommand]="baseCommand"
                                        *ngIf="version === 'v1.0'"
                                        (update)="updateCmd.emit($event)"
                                        [readonly]="readonly">
                </ct-base-command-string>

                <hr>
                <ct-streams [stdin]="stdin"
                            [stdout]="stdout"
                            [context]="context"
                            [readonly]="readonly"
                            (update)="updateStream.emit($event)">
                </ct-streams>
            </div>
        </ct-form-panel>
    `
})
export class BaseCommandComponent extends DirectiveBase implements OnChanges {
    /** baseCommand property of model */
    @Input()
    baseCommand: ExpressionModel[] | string[];

    version: "sbg:draft-2" | "v1.0" | string;

    /** Stdin property of model */
    @Input()
    stdin: ExpressionModel;

    /** Stdout property of model */
    @Input()
    stdout: ExpressionModel;

    /** The parent forms group which is already in the clt-editor form tree */
    @Input()
    form: FormGroup;

    /** Context in which expression should be evaluated */
    @Input()
    context: any;

    @Input()
    readonly = false;

    @Input()
    model: CommandLineToolModel;

    /** Update event triggered on command form changes (add, remove, edit) */
    @Output()
    updateCmd = new EventEmitter<ExpressionModel[]>();

    @Output()
    updateStream = new EventEmitter<ExpressionModel>();

    ngOnChanges() {
        if (this.model) {
            this.version = this.model.cwlVersion;
        }
    }
}
