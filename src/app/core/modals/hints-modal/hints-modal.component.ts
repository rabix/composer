import {Component, EventEmitter, Input, Output} from "@angular/core";
import {CommandLineToolModel, StepModel, WorkflowModel} from "cwlts/models";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";


@Component({
    selector: "ct-hints-modal",
    template: `
        <div class="body pl-1 pr-1 mt-1">

            <ct-hint-list [model]="model"
                          [readonly]="readonly"
                          (update)="update.next($event)">
            </ct-hint-list>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="modal.close()">Close</button>
            </div>
        </div>
    `,
    styleUrls: ["./hints-modal.component.scss"],
})
export class HintsModalComponent extends DirectiveBase {

    @Input()
    model: CommandLineToolModel | WorkflowModel | StepModel;

    @Input()
    readonly = false;

    @Output()
    update = new EventEmitter();

    constructor(public modal: ModalService) {
        super();
    }

}
