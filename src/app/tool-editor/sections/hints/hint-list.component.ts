import {Component, Input, OnDestroy, OnInit, Output} from "@angular/core";
import {FormControl} from "@angular/forms";
import {ExpressionModel, RequirementBaseModel} from "cwlts/models";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {ExternalLinks} from "../../../cwl/external-links";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

/**
 * @deprecated
 */
@Component({
    selector: "ct-hint-list",
    template: `
        <ct-form-panel [collapsed]="false">
            <div class="tc-header">
                Hints
            </div>

            <div class="tc-body">

                <ct-key-value-list
                        [addEntryText]="'Add a Hint'"
                        [emptyListText]="'Special flags for tool execution'"
                        [keyColumnText]="'Class'"
                        [helpLink]="helpLink"
                        [context]="context"
                        [allowDuplicateKeys]="false"
                        [keyValidator]="validateClassForm"
                        [formControl]="form"></ct-key-value-list>
            </div>
        </ct-form-panel>
    `
})
export class HintListComponent extends DirectiveBase implements OnInit, OnDestroy {

    /** Context in which expression should be evaluated */
    @Input()
    context: any = {};

    /** List of entries that should be shown */
    @Input()
    entries: RequirementBaseModel[] = [];

    @Input()
    readonly = false;

    formList: {
        key?: string,
        value: string | ExpressionModel,
        readonly: boolean
    }[] = [];

    @Output()
    update = new ReplaySubject<any>();

    helpLink = ExternalLinks.hints;

    form = new FormControl("");

    ngOnInit(): void {
        const entriesCopy: RequirementBaseModel[] = [...this.entries];

        this.formList = this.createFormList(entriesCopy);
        this.form.setValue(this.formList);

        this.tracked = this.form.valueChanges.subscribe(keyValueList => {
            const newList: Array<RequirementBaseModel | any> = this.createHintList(keyValueList);
            this.update.next(newList);
        });
    }


    createFormList(entries: RequirementBaseModel[]): {
        key: string,
        value: string | ExpressionModel,
        readonly: boolean
    }[] {
        return entries.map((hint: RequirementBaseModel) => {
            const newHint = {
                key: hint["class"],
                value: <string | ExpressionModel>"",
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

    createHintList(formList: {
                       key?: string,
                       value: string | ExpressionModel,
                       readonly: boolean
                   }[]): any[] {

        return formList
            .map((item): RequirementBaseModel | any => {

                if (item.readonly && typeof item.value === "string") {
                    if (!!item.key && !!item.key.trim()) {
                        return new RequirementBaseModel({
                            "class": item.key,
                            customProps: JSON.parse(item.value)
                        }).serialize();

                    } else if (!item.key) {
                        return JSON.parse(item.value);
                    }
                }

                if (!!item.key && !!item.key.trim() && !item.readonly) {
                    return new RequirementBaseModel({
                        "class": item.key,
                        value: (<ExpressionModel>item.value).serialize()
                    }).serialize();
                }
            })
            .filter(res => res !== undefined);
    }

    validateClassForm(c: FormControl) {

        if (c.value === "sbg:MemRequirement"
            || c.value === "sbg:CPURequirement"
            || c.value === "DockerRequirement") {

            return {
                warning: {
                    message: "This requirement is already defined and will be overwritten."
                }
            };
        }

        return null;
    }
}
