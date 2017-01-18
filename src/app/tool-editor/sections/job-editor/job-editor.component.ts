import {Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges} from "@angular/core";
import {CommandInputParameterModel} from "cwlts/models/v1.0";
import {ObjectHelper} from "../../../helpers/object.helper";

@Component({
    selector: "ct-job-editor",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        {{ job | json }}
    `
})
export class JobEditorComponent implements OnChanges {

    @Input()
    public job: {
        allocatedResources?: {
            cpu: string,
            mem: string
        },
        inputs?: any[]
    } = {};

    @Input()
    public inputs: CommandInputParameterModel[] = [];

    private inputGroups: { name: string, inputs: CommandInputParameterModel[] }[] = [];

    ngOnChanges(changes: SimpleChanges) {
        // this.inputs.sort((a, b) => {
        //     const categoryA = ObjectHelper.
        // });
        this.inputGroups = this.inputs.reduce((acc, item) => {
            return {...acc};
        }, {});
    }
}
