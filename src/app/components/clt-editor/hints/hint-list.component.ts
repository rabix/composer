import {Component, Input, ChangeDetectionStrategy, Output} from "@angular/core";
import {ComponentBase} from "../../common/component-base";
import {ExternalLinks} from "../../../cwl/external-links";
import {ExpressionModel, RequirementBaseModel} from "cwlts/models/d2sb";
import {FormGroup, FormControl} from "@angular/forms";
import {GuidService} from "../../../services/guid.service";
import {ReplaySubject} from "rxjs";
import {HintListInputComponent} from "./custom-hint-input.component";

@Component({
    selector: "ct-hint-list",
    changeDetection: ChangeDetectionStrategy.OnPush,
    directives: [HintListInputComponent],
    template: `
        <ct-form-panel [collapsed]="false">
            <div class="tc-header">
                Hints
            </div>

            <div class="tc-body">

                <ct-blank-tool-state *ngIf="!readonly && !formList.length"
                                     [title]="'Special flags for tool execution'"
                                     [buttonText]="'Add a Hint'"
                                     [learnMoreURL]="helpLink"
                                     (buttonClick)="addEntry()">
                </ct-blank-tool-state>

                <div *ngIf="formList.length" class="container">
                    <div class="gui-section-list-title col-sm-12 row">
                        <div class="col-sm-5">Class</div>
                        <div class="col-sm-6">Value</div>
                    </div>

                    <ul class="gui-section-list">

                        <li ct-hint-list-input *ngFor="let entry of formList; let i = index"
                                class="col-sm-12 gui-section-list-item clickable row"
                                [context]="context"
                                [formControl]="form.controls[entry.id]">
                                
                            <div *ngIf="!!entry" class="col-sm-1 align-right">
                                <i title="Delete" class="fa fa-trash text-hover-danger" (click)="removeEntry(entry)"></i>
                            </div>
                        </li>
                        
                    </ul>
                </div>

                <button *ngIf="!readonly && formList.length"
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
    public entries: {[id:string]: {"class"?: string, value?: string | ExpressionModel}};

    private formList: {id: string, model: RequirementBaseModel}[] = [];

    @Input()
    public readonly = false;

    @Output()
    public update = new ReplaySubject<any>();

    private helpLink = ExternalLinks.hints;

    private form = new FormGroup({});

    constructor(private guidService: GuidService) {
        super();
    }

    private addEntry(): void {
        const newRequirement = {
            id: this.guidService.generate(),
            model: new RequirementBaseModel({
                'class': "",
                value: new ExpressionModel()
            }, null)
        };

        this.formList.push(newRequirement);
        this.form.addControl(newRequirement.id, new FormControl(newRequirement.model));
    }

    ngOnInit(): void {
        const entriesCopy = Object.assign({}, this.entries);

        this.formList = Object.keys(entriesCopy).map(key => {
            return {
                id: this.guidService.generate(),
                model: this.entries[key]
            };
        });

        this.formList.forEach(hint => {
            this.form.addControl(hint.id, new FormControl(hint.model));
        });

        this.tracked = this.form.valueChanges.subscribe(_ => this.propagateHintList());
    }

    private removeEntry(ctrl: {id: string, model: ExpressionModel}): void {
        this.formList = this.formList.filter(item => item.id !== ctrl.id);
        this.form.removeControl(ctrl.id);
        this.form.markAsDirty();
    }

    private propagateHintList(): void {
        const hintList = this.formList
            .filter(hint => !!hint.model.class.trim())
            .map(hint => hint.model);

        this.update.next(hintList);
    }

    ngOnDestroy() {
        this.formList.forEach(item => this.form.removeControl(item.id));
        super.ngOnDestroy();
    }
}
