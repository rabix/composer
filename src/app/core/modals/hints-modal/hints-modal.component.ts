import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {
    CommandLineToolModel,
    ExpressionModel,
    ProcessRequirementModel,
    RequirementBaseModel,
    StepModel,
    WorkflowModel
} from "cwlts/models";
import {ModalService} from "../../../ui/modal/modal.service";
import {FormControl} from "@angular/forms";
import {ErrorCode} from "cwlts/models/helpers/validation";
import {V1ExpressionModel} from "cwlts/models/v1.0";
import {SBDraft2ExpressionModel} from "cwlts/models/d2sb";


@Component({
    selector: "ct-hints-modal",
    template: `
        <div class="body pl-1 pr-1 mt-1">
            
            <ct-hint-list [cwlVersion]="cwlVersion"
                          [readonly]="readonly"
                          [formControl]="formControl"></ct-hint-list>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="modal.close()">Cancel</button>
                <button type="button" class="btn btn-primary" (click)="save()">Save</button>
            </div>
        </div>
    `,
    styleUrls: ["./hints-modal.component.scss"],
})
export class HintsModalComponent implements OnInit {

    @Input()
    model: CommandLineToolModel | WorkflowModel | StepModel;

    @Input()
    readonly = false;

    @Output() saved = new EventEmitter<ProcessRequirementModel[]>();

    cwlVersion: string;

    formControl: FormControl;

    constructor(public modal: ModalService) {
    }

    ngOnInit() {
        if (this.model instanceof CommandLineToolModel || this.model instanceof WorkflowModel) {
            this.cwlVersion = this.model.cwlVersion;
        } else {
            this.cwlVersion = this.model.run.cwlVersion;
        }

        const modelHintsCopy = [];
        this.model.hints.forEach(hint => {
            modelHintsCopy.push(Object.assign({}, hint,
                {value: this.cwlVersion === "v1.0" ? new V1ExpressionModel(hint["value"].value) :
                        new SBDraft2ExpressionModel(hint["value"].value)}));
        });

        this.formControl = new FormControl(modelHintsCopy);
    }

    save() {
        const hints     = this.formControl.value;
        const removeArr = [];
        const regex     = new RegExp("(\\d+)(?!.*\\d)");

        this.model.hints.forEach((mHint, i) => {
            const hintNum = parseInt(mHint.loc.match(regex)[0]);
            const hint    = hints.filter(h => h.loc && h.loc.indexOf(`hints[${hintNum}]`) !== -1)[0];

            if (!hint) {
                removeArr.push(i);

            } else {

                mHint["class"] = hint["class"];
                mHint["value"].value = hint["value"].value;
            }
        });

        for (let i = removeArr.length - 1; i >= 0; i--) {
            const remIndex = removeArr[i];
            this.model.hints[remIndex].clearIssue(ErrorCode.EXPR_ALL);
            this.model.hints.splice(remIndex, 1);
        }

        const newHints = hints.filter((h) => !h.hasOwnProperty("loc"));
        newHints.forEach(hint => {
            this.model.addHint({class: hint.class, value: hint.value.value});
        });

        this.saved.emit();

        this.modal.close();
    }
}
