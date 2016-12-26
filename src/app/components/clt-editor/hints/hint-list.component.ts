import {Component, Input, Output, ChangeDetectionStrategy} from "@angular/core";
import {ComponentBase} from "../../common/component-base";
import {ExternalLinks} from "../../../cwl/external-links";
import {ExpressionModel} from "cwlts/models/d2sb";
import {FormControl} from "@angular/forms";
import {ReplaySubject} from "rxjs";
import {RequirementBaseModel} from "cwlts";

@Component({
    selector: "ct-hint-list",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ct-form-panel [collapsed]="false">
            <div class="tc-header">
                Hints
            </div>

            <div class="tc-body">

                <key-value-list 
                    [addEntryText]="'Add a Hint'"
                    [emptyListText]="'Special flags for tool execution'"
                    [keyColumnText]="'Class'"
                    [helpLink]="helpLink"
                    [keyValidator]="validateClassForm"
                    [context]="context"
                    [formControl]="form"></key-value-list>
            </div>
        </ct-form-panel>
`
})
export class HintListComponent extends ComponentBase {

    /** Context in which expression should be evaluated */
    @Input()
    public context: {$job: any} = { $job: {} };

    /** List of entries that should be shown */
    @Input()
    public entries: RequirementBaseModel[] = [];

    private keyValueFormList: {key: string, value: string | ExpressionModel}[] = [];

    @Input()
    public readonly = false;

    @Output()
    public update = new ReplaySubject<any>();

    private helpLink = ExternalLinks.hints;

    private form: FormControl;

    ngOnInit(): void {
        const entriesCopy: RequirementBaseModel[] = [...this.entries];

        this.keyValueFormList = entriesCopy.map((hint: RequirementBaseModel) => {
            return {
                key: hint['class'],
                value: hint.value
            }
        });

        this.form = new FormControl(this.keyValueFormList);

        this.tracked = this.form.valueChanges.subscribe(keyValueList => {

            const newList = keyValueList.map((item: {key: string, value: ExpressionModel}) => {
                return new RequirementBaseModel({
                    'class': item.key,
                    value: item.value
                });
            });

            this.update.next(newList);
        });
    }

    private validateClassForm(c: FormControl): null | {message: string} {

        if (c.value  === "sbg:MemRequirement"
            || c.value === "sbg:CPURequirement"
            || c.value === "DockerRequirement") {

            return {
                message: "Class name is not valid."
            }
        }

        return null;
    }
}
