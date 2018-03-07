import {Component, Input, OnInit, Output, Inject} from "@angular/core";
import {FormGroup, FormControl} from "@angular/forms";
import {CommandInputParameterModel, CommandLineToolModel} from "cwlts/models";
import {Subject} from "rxjs/Subject";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {Store} from "@ngrx/store";
import {InputTestValueChangeAction} from "../../reducers/actions";
import {AppInfoToken, AppInfo} from "../../../editor-common/factories/app-info.factory";
import {AppState} from "../../reducers";
import {appTestData} from "../../reducers/selectors";
import {filter, map} from "rxjs/operators";

@Component({
    selector: "ct-tool-input-inspector",
    template: `
        <form [formGroup]="inputForm">

            <ct-basic-input-section [formControl]="inputForm.controls['basicInputSection']"
                                    [context]="context"
                                    [model]="model">
            </ct-basic-input-section>

            <ct-description-section [formControl]="inputForm.controls['description']"></ct-description-section>


            <ct-form-panel *ngIf="isRootInput" class="borderless">
                <div class="tc-header">Test Value</div>
                <div class="tc-body">
                    <ct-input-value-editor [formControl]="testValueControl"
                                           [inputType]="input.type.type"
                                           [inputArrayItemsType]="input.type.items"
                                           [inputEnumSymbols]="input.type.symbols"
                                           [inputRecordFields]="input.type.fields"
                    ></ct-input-value-editor>
                </div>
            </ct-form-panel>


        </form>
    `
})
export class ToolInputInspectorComponent extends DirectiveBase implements OnInit {

    @Input() input: CommandInputParameterModel;

    /** Context in which expression should be evaluated */
    @Input() model: CommandLineToolModel;

    disabled = false;

    testValueControl = new FormControl();

    get readonly(): boolean {
        return this.inputForm.disabled;
    }

    @Input("readonly")
    set readonly(isDisabled: boolean) {
        if (this.inputForm) {
            const eventDescriptor = {onlySelf: true, emitEvent: false};
            isDisabled ? this.inputForm.disable(eventDescriptor) : this.inputForm.enable(eventDescriptor);
        }
    }

    inputForm: FormGroup;

    context: any;

    /**
     * We should show test value edit field only for root level inputs
     * Showing it for nested structures would not work because, for example, when having an array of records, inspecting
     * that record and editing it's value doesn't make sense because it's just a template, and an actual value an number of values
     * come from an enclosing array input.
     */
    isRootInput: Boolean;

    @Output()
    save = new Subject<CommandInputParameterModel>();

    constructor(private store: Store<AppState>,
                @Inject(AppInfoToken) private appInfo: AppInfo) {
        super();
    }

    ngOnInit() {

        // We count on loc being in the format “document.inputs[2].some.nested[1].thing”
        this.isRootInput = this.input.loc.split(".").length === 2;

        this.testValueControl.valueChanges.subscribeTracked(this, value => {
            this.store.dispatch(new InputTestValueChangeAction(this.appInfo.id, this.input.id, this.testValueControl.value));
        });

        const appTestJob   = this.store.select(appTestData(this.appInfo.id));
        const inputTestJob = appTestJob.pipe(filter(v => v !== undefined), map(appMockData => appMockData[this.input.id]));

        appTestJob.subscribeTracked(this, () => {
            this.context = this.model.getContext(this.input);
        });


        inputTestJob.pipe(
            filter(val => val !== this.testValueControl.value)
        ).subscribeTracked(this, mockValue => {
            this.context = this.model.getContext(this.input);
            this.testValueControl.setValue(mockValue, {emitEvent: false});
        });

        this.inputForm = new FormGroup({
            basicInputSection: new FormControl(this.input),
            description: new FormControl(this.input),
            stageInputSection: new FormControl(this.input),
        });

        this.inputForm.valueChanges.subscribeTracked(this, () => {
            this.save.next(this.input);
        });
    }
}
