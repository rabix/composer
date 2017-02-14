import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges
} from "@angular/core";
import {SBDraft2CommandInputParameterModel} from "cwlts/models/d2sb";
import {JobHelper} from "cwlts/models/helpers/JobHelper";
import {ObjectHelper} from "../../helpers/object.helper";

@Component({
    selector: "ct-job-editor-entry",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="alert alert-warning form-control-label" *ngIf="warning">{{ warning }}</div>
        <div [ngSwitch]="inputType" class="form-group">

            <!--Each leaf field will be wrapped as an input group-->
            <!--Nested fields below should not be wrapped into other container elements-->
            <!--because it will break size and positioning-->
            <div class="input-group">

                <!--Enums-->
                <template ngSwitchCase="enum">
                    <select [value]="value" class="form-control"                           
                            [attr.prefix]="prefix">
                        <option *ngFor="let val of input.type.symbols" [value]="val"> {{ val }}
                        </option>
                    </select>
                </template>

                <!--Numbers-->
                <template ngSwitchCase="int">
                    <input [attr.prefix]="prefix"
                           type="number"
                           class="form-control"
                           [value]="value"/>
                </template>
                <template ngSwitchCase="float">
                    <input [attr.prefix]="prefix"
                           type="number"
                           class="form-control"
                           [value]="value"/>
                </template>

                <!--Strings-->
                <template ngSwitchCase="string">
                    <input [attr.prefix]="prefix"
                           class="form-control"
                           [value]="value"/>
                </template>

                <!--Booleans-->
                <template ngSwitchCase="boolean">
                    <ct-toggle-slider class="pull-right"
                                      [attr.prefix]="prefix"
                                      (change)="updateJob($event)"
                                      [value]="value"></ct-toggle-slider>
                </template>

                <!--Maps-->
                <template ngSwitchCase="map">
                    <ct-map-list class="form-group"
                                 [attr.prefix]="prefix"
                                 (change)="updateMap(value)"
                                 [ngModel]="value"></ct-map-list>
                </template>

                <!--Files-->
                <template ngSwitchCase="File">
                    <input [attr.jobPropPath]="'path'"
                           [attr.prefix]="prefix"
                           class="form-control"
                           [value]="value?.path"/>
                    <span class="input-group-btn">
                        
                        <button type="button" class="btn btn-secondary"
                                [ct-editor-inspector]="fileInspector">
                            <i class="fa fa-ellipsis-h"></i>
                        </button>
                    </span>

                    <template #fileInspector>
                        <ct-editor-inspector-content>
                            <div class="tc-header">{{ input?.id }}</div>
                            <div class="tc-body">
                                <ct-file-input-inspector [input]="value || {}"
                                                         (update)="updateFile($event)">
                                </ct-file-input-inspector>
                            </div>
                        </ct-editor-inspector-content>
                    </template>
                </template>

                <!--Every element that's a part of the array can be deleted, so we add a deletion button to it-->
                <span class="input-group-btn" *ngIf="index !== -1">
                    <button type="button" class="btn btn-secondary" (click)="deleteFromArray()">
                        <i class="fa fa-trash"></i>
                    </button>
                </span>
            </div>

            <!--Records-->
            <template ngSwitchCase="record">
                <ct-job-editor-entry *ngFor="let entry of input.type.fields"
                                     [prefix]="prefix + '.' + entry.id"
                                     [input]="entry"
                                     (update)="updateRecord(entry.id, $event)"
                                     [value]="value ? value[entry.id] : undefined"></ct-job-editor-entry>
            </template>

            <!--Arrays-->
            <template ngSwitchCase="array">
                <ct-job-editor-entry *ngFor="let entry of value; let i = index"
                                     [prefix]="prefix + '.[' + i +']'"
                                     [index]="i"
                                     [input]="arrayModifiedInput"
                                     (update)="updateArray(i, $event)"
                                     [value]="entry"></ct-job-editor-entry>

                <button (click)="addArrayEntry(input)"
                        type="button"
                        class="btn pl-0 btn-link no-outline no-underline-hover">
                    <i class="fa fa-plus"></i> New {{ input.type.items }}
                </button>
            </template>

            <!--Unknown-->
            <template ngSwitchDefault>
                <div class="alert alert-info">Unknown input type: {{ inputType }}</div>
            </template>
        </div>
    `
})
export class JobEditorEntryComponent implements OnChanges {

    @Input()
    public input: SBDraft2CommandInputParameterModel;

    @Input()
    public value: any;

    @Input()
    public index = -1;

    @Input()
    public prefix;

    @Output()
    public update = new EventEmitter<any>();

    public inputType: string;

    /**
     * We might want to show a warning next to a field.
     * This can happen for example if we encounter a mismatch between job value and the input type,
     * for example, an input can by File[], and the job value can be just a plain string.
     */
    public warning: string;

    public arrayModifiedInput;

    public updateJob(data) {
        this.update.emit(data);
    }

    private updateFile(data) {
        this.updateJob(data);
    }

    private updateMap(map) {
        this.updateJob(map);
    }

    private updateRecord(entryId, event) {

        const data = {...(this.value || {})};
        ObjectHelper.addProperty(data, entryId, event);
        let d = {
            ...data,
            [entryId]: Array.isArray(event) || this.isPrimitiveValue(event) ? event : {...event}
        };

        this.updateJob(d);
    }


    /**
     * Returns true if arg is one of: [undefined, null, number, boolean, string]
     */
    private isPrimitiveValue(arg: any) {
        const type = typeof arg;
        return arg == null || (type != "object" && type != "function");
    }

    public updateArray(index, data) {

        // We need some kind of convention to broadcast information
        // that an array element should be deleted
        if (data === undefined) {
            this.updateJob(this.value.filter((e, i) => i !== index));
            return;
        }

        // This is tricky.
        // We need to update the original value in place, and cant replace its reference because
        // of the object inspector, which would still point to the previous entry.
        // We can't close and reopen the inspector because it would break the control focus.
        Object.keys(this.value[index]).forEach((item) => delete this.value[index][item]);
        this.value[index] = Object.assign(this.value[index], data);

        this.updateJob(this.value.slice());
    }

    private addArrayEntry(input) {
        this.warning         = undefined;
        const generatedEntry = JobHelper.generateMockJobData(input);
        this.updateJob((this.value || []).concat(generatedEntry.slice(0, 1)));
    }

    private deleteFromArray() {
        this.updateJob(undefined);
    }

    ngOnInit() {
        // If we are expecting an array, but didn't get one, we won't fill up any components,
        // just show the user a warning about the type mismatch
        if (this.inputType === "array"
            && !Array.isArray(this.value)
            && this.value !== undefined) {

            this.value   = [];
            this.warning = `Type mismatch: the default job value for this input 
                            is of type “${typeof this.value}”, but the input is declared 
                            as “${this.inputType}”. 
                            You can generate a new set of test data for this input by clicking 
                            on the “New ${this.input.type.items}” button.`
        }
    }

    ngOnChanges(changes: SimpleChanges) {

        this.inputType = this.input.type.type;

        if (this.inputType === "array") {
            this.arrayModifiedInput = {
                ...this.input,
                type: {
                    ...this.input.type,
                    type: this.input.type.items
                }
            }
        }
    }
}
