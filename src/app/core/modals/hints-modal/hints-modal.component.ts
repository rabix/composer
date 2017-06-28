import {Component, Input} from "@angular/core";
import {ModalService} from "../../../ui/modal/modal.service";
import {CommandLineToolModel, StepModel, WorkflowModel} from "cwlts/models";


@Component({
    selector: "ct-hints-modal",
    template: `
        <div class="body pl-1 pr-1 mt-1">

            <ct-hint-list [model]="model"
                      [readonly]="readonly">
            </ct-hint-list>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="modal.close()">Close</button>
            </div>
        </div>
    `,
    styleUrls: ["./hints-modal.component.scss"],
})
export class HintsModalComponent {

    @Input()
    model: CommandLineToolModel | WorkflowModel | StepModel;

    @Input()
    readonly = false;

    constructor(public modal: ModalService) {
    }

}
