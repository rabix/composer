import {Component, Input, Output, ChangeDetectionStrategy} from "@angular/core";
import {ComponentBase} from "../../common/component-base";
import {ExternalLinks} from "../../../cwl/external-links";
import {ExpressionModel, RequirementBaseModel} from "cwlts/models/d2sb";
import {FormControl} from "@angular/forms";
import {ReplaySubject} from "rxjs";

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
                    [context]="context"
                    [allowDuplicateKeys]="false"
                    [keyValidator]="validateClassForm"
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

    private formList: {
        key?: string,
        value: string | ExpressionModel,
        readonly: boolean
    }[] = [];

    @Input()
    public readonly = false;

    @Output()
    public update = new ReplaySubject<any>();

    private helpLink = ExternalLinks.hints;

    private form = new FormControl("");

    ngOnInit(): void {
        const entriesCopy: RequirementBaseModel[] = [...this.entries];

        this.formList = this.createFormList(entriesCopy);
        this.form.setValue(this.formList);

        this.tracked = this.form.valueChanges.subscribe(keyValueList => {
            const newList: Array<RequirementBaseModel | any> = this.createHintList(keyValueList);
            this.update.next(newList);
        });
    }


    private createFormList(entries: RequirementBaseModel[]): {key: string, value: string, readonly: boolean}[] {

        return entries.map((hint: RequirementBaseModel) => {
            let newHint = {
                key: hint['class'],
                value: "",
                readonly: false
            };

            if (typeof hint.value === "string" || hint.value instanceof ExpressionModel) {
                newHint.value = hint.value;

            } else {
                newHint.readonly = true;

                if (!!hint.customProps && !hint.value) {
                    newHint.value = JSON.stringify(hint.customProps);
                } else if (hint.value) {
                    newHint.value = JSON.stringify(hint.value);
                }
            }

            return newHint;
        });
    }

    private createHintList(formList: {
        key?: string,
        value: string | ExpressionModel,
        readonly: boolean
    }[]): any[] {

        return formList
            .map((item): RequirementBaseModel | any => {

                if (item.readonly && typeof item.value === "string") {
                    if (!!item.key && !!item.key.trim()) {
                        return new RequirementBaseModel({
                            'class': item.key,
                            customProps: JSON.parse(item.value)
                        }).serialize();

                    } else  if (!item.key) {
                        return JSON.parse(item.value);
                    }
                }

                if (!!item.key && !!item.key.trim() && !item.readonly) {
                    return new RequirementBaseModel({
                        'class': item.key,
                        value: (<ExpressionModel>item.value).serialize()
                    }).serialize();
                }
            })
            .filter(res => res !== undefined);
    }

    private validateClassForm(c: FormControl) {

        if (c.value  === "sbg:MemRequirement"
            || c.value === "sbg:CPURequirement"
            || c.value === "DockerRequirement") {

            return {
                warning: {
                    message: "This requirement is already defined and will be overwritten."
                }
            }
        }

        return null;
    }
}
