import {Component, EventEmitter, Input, Output} from "@angular/core";
import {CommandLineToolModel, ExpressionModel} from "cwlts/models";

@Component({
    selector: "ct-tool-other",
    template: `
        <ct-form-panel>
            <div class="tc-header">
                Other
            </div>
            <div class="tc-body">

                <ct-tool-streams [model]="model"
                                 [stdin]="model.stdin"
                                 [stdout]="model.stdout"
                                 [stderr]="model.stderr"
                                 [context]="context"
                                 [readonly]="readonly"
                                 (update)="updateStream.emit($event)">
                </ct-tool-streams>

                <hr class="mt-0 mb-1"/>

                <ct-tool-codes [model]="model"
                               [successCodes]="model.successCodes"
                               [temporaryFailCodes]="model.temporaryFailCodes"
                               [permanentFailCodes]="model.permanentFailCodes"
                               [readonly]="readonly"
                               (update)="updateCodes.emit($event)">
                </ct-tool-codes>

            </div>
        </ct-form-panel>
    `
})
export class ToolOtherComponent {

    /** Context in which expression should be evaluated */
    @Input()
    context: any;

    @Input()
    readonly = false;

    @Input()
    model: CommandLineToolModel;

    @Output()
    updateStream = new EventEmitter<ExpressionModel>();

    @Output()
    updateCodes = new EventEmitter<ExpressionModel>();

}
