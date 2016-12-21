import {Component, Input, Output, ChangeDetectionStrategy} from "@angular/core";
import {ComponentBase} from "../../common/component-base";
import {ExternalLinks} from "../../../cwl/external-links";
import {ExpressionModel} from "cwlts/models/d2sb";
import {FormGroup, FormControl} from "@angular/forms";
import {GuidService} from "../../../services/guid.service";
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

                <ct-blank-tool-state *ngIf="!readonly && !keyValueFormList.length"
                                     [title]="'Special flags for tool execution'"
                                     [buttonText]="'Add a Hint'"
                                     [learnMoreURL]="helpLink"
                                     (buttonClick)="addEntry()">
                </ct-blank-tool-state>

                <div *ngIf="keyValueFormList.length" class="container">
                    <div class="gui-section-list-title col-sm-12 row">
                        <div class="col-sm-5">Class</div>
                        <div class="col-sm-6">Value</div>
                    </div>

                    <ul class="gui-section-list">

                        <li ct-key-value-input *ngFor="let entry of keyValueFormList; let i = index"
                                class="col-sm-12 gui-section-list-item clickable row"
                                [context]="context"
                                [formControl]="form.controls[entry.id]"
                                [keyValidator]="validateClassForm">
                                
                            <div *ngIf="!!entry" class="col-sm-1 align-right">
                                <i title="Delete" class="fa fa-trash text-hover-danger" (click)="removeEntry(entry)"></i>
                            </div>
                        </li>
                        
                    </ul>
                </div>

                <button *ngIf="!readonly && keyValueFormList.length"
                        (click)="addEntry()"
                        type="button"
                        class="btn pl-0 btn-link no-outline no-underline-hover">
                    <i class="fa fa-plus"></i> Add Hint
                </button>
            </div>
        </ct-form-panel>
`
})
export class HintListComponent extends ComponentBase {

    /** Context in which expression should be evaluated */
    @Input()
    public context: {$job: any} = {};

    /** List of entries that should be shown */
    @Input()
    public entries: RequirementBaseModel[] = [];

    private keyValueFormList: {id: string, model: {"key"?: string, value?: string | ExpressionModel}}[] = [];

    @Input()
    public readonly = false;

    @Output()
    public update = new ReplaySubject<any>();

    private helpLink = ExternalLinks.hints;

    private form = new FormGroup({});

    constructor(private guidService: GuidService) {
        super();
    }

    ngOnInit(): void {
        const entriesCopy: RequirementBaseModel[] = [...this.entries];

        this.keyValueFormList = entriesCopy.map((hint: RequirementBaseModel) => {
            return {
                id: this.guidService.generate(),
                model: {
                    key: hint['class'],
                    value: hint.value
                }
            }
        });

        this.keyValueFormList.forEach(hint => {
            this.form.addControl(hint.id, new FormControl(hint.model));
        });

        this.listenToFormChanges();
    }

    private listenToFormChanges(): void {

        this.tracked = this.form.valueChanges.subscribe(change => {

            const newList = Object.keys(change)
                .filter(key => !!change[key].key.trim())
                .map(key => {
                    const newKeyValueObject: {key: string, value?: string | ExpressionModel} = change[key];

                    return new RequirementBaseModel({
                        'class': newKeyValueObject.key,
                        value: newKeyValueObject.value
                    });
                });

            this.propagateHintList(newList);
        });
    }

    private addEntry(): void {
        const newRequirement = {
            id: this.guidService.generate(),
            model: {
                key: "",
                value: new ExpressionModel()
            }
        };

        this.keyValueFormList.push(newRequirement);
        this.form.addControl(newRequirement.id, new FormControl(newRequirement.model));
    }

    private removeEntry(ctrl: {id: string, model: ExpressionModel}): void {
        this.keyValueFormList = this.keyValueFormList.filter(item => item.id !== ctrl.id);
        this.form.removeControl(ctrl.id);
        this.form.markAsDirty();
    }

    private propagateHintList(newList): void {
        this.update.next(newList);
    }

    private validateClassForm(c: FormControl) {

        if (c.value  === "sbg:MemRequirement"
            || c.value === "sbg:CPURequirement"
            || c.value === "DockerRequirement") {

            return {
                valid: false,
                message: "Class name is not valid"
            }
        }

        return null;
    }

    ngOnDestroy() {
        this.keyValueFormList.forEach(item => this.form.removeControl(item.id));
        super.ngOnDestroy();
    }
}
