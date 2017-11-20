import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewEncapsulation
} from "@angular/core";
import {CommandInputParameterModel} from "cwlts/models";
import {JobHelper} from "cwlts/models/helpers/JobHelper";
import {ObjectHelper} from "../../helpers/object.helper";
import {EditorInspectorService} from "../inspector/editor-inspector.service";

/**
 * @deprecated
 */
@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-job-editor-entry-old",
    styleUrls: ["./job-editor-entry.component.scss"],

    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="form-control-label" *ngIf="warning">        
            <span class="text-warning">
                <i class="fa fa-warning fa-fw"></i>
                    {{ warning }}
            </span>
        </div>

        <div [ngSwitch]="inputType" class="form-group">

            <!--Each leaf field will be wrapped as an input group-->
            <!--Nested fields below should not be wrapped into other container elements-->
            <!--because it will break size and positioning-->
            <div class="input-group">

                <!--Enums-->
                <ng-template ngSwitchCase="enum">
                    <select [value]="value" class="form-control"
                            [attr.prefix]="prefix"
                            [attr.fieldType]="inputType">
                        <option *ngFor="let val of input.type.symbols" [value]="val"> {{ val }}
                        </option>
                    </select>
                </ng-template>

                <!--Numbers-->
                <ng-template ngSwitchCase="int">
                    <input [attr.prefix]="prefix"
                           [attr.fieldType]="inputType"
                           type="number"
                           class="form-control"
                           [value]="value"/>
                </ng-template>
                <ng-template ngSwitchCase="float">
                    <input [attr.prefix]="prefix"
                           [attr.fieldType]="inputType"
                           type="number"
                           class="form-control"
                           [value]="value"/>
                </ng-template>

                <!--Strings-->
                <ng-template ngSwitchCase="string">
                    <input [attr.prefix]="prefix"
                           [attr.fieldType]="inputType"
                           class="form-control"
                           [value]="value"/>
                </ng-template>

                <!--Booleans-->
                <ng-template ngSwitchCase="boolean">
                    <ct-toggle-slider class="pull-right"
                                      [attr.prefix]="prefix"
                                      [attr.fieldType]="inputType"
                                      (valueChange)="updateJob($event)"
                                      [value]="value"></ct-toggle-slider>
                </ng-template>

                <!--Maps-->
                <ng-template ngSwitchCase="map">
                    <ct-map-list class="form-group"
                                 [attr.prefix]="prefix"
                                 [attr.fieldType]="inputType"
                                 (change)="updateMap($event)"
                                 [ngModel]="value"></ct-map-list>
                </ng-template>

                <!--Files-->
                <ng-template ngSwitchCase="File">
                    <input [attr.jobPropPath]="'path'"
                           [attr.prefix]="prefix"
                           [attr.fieldType]="inputType"
                           class="form-control"
                           [value]="value?.path"/>
                    <span class="input-group-btn">
                        
                        <button type="button" class="btn btn-secondary"
                                [ct-editor-inspector]="fileInspector"
                                [ct-editor-inspector-target]="value">
                            <i class="fa fa-ellipsis-h"></i>
                        </button>
                    </span>

                    <ng-template #fileInspector>
                        <ct-editor-inspector-content>
                            <div class="tc-header">{{ input?.id }}</div>
                            <div class="tc-body">
                                <ct-file-input-inspector
                                    [path]="value?.path"
                                    [input]="value || {}"
                                    (update)="updateFile($event)">
                                </ct-file-input-inspector>
                            </div>
                        </ct-editor-inspector-content>
                    </ng-template>
                </ng-template>

                <!--Directories-->
                <ng-template ngSwitchCase="Directory">
                    <input [attr.jobPropPath]="'path'"
                           [attr.prefix]="prefix" class="form-control" [value]="value?.path"/>
                    <span class="input-group-btn">
                        <button class="btn btn-secondary"
                                [ct-editor-inspector-target]="value"
                                [ct-editor-inspector]="directoryInspector">
                                                        <i class="fa fa-ellipsis-h"></i>

                        </button>
                    </span>
                    <ng-template #directoryInspector>
                        <ct-editor-inspector-content>
                            <div class="tc-header">{{ input?.id }}</div>
                            <div class="tc-body">
                                <ct-directory-input-inspector
                                    [path]="value?.path"
                                    [input]="value || {}"
                                    (update)="updateDirectory($event)">
                                </ct-directory-input-inspector>
                            </div>
                        </ct-editor-inspector-content>
                    </ng-template>
                </ng-template>

                <!--Every element that's a part of the array can be deleted, so we add a deletion button to it-->
                <span [class]="inputType !== 'record' ? 'input-group-btn' : 'record-delete'"
                      *ngIf="index !== -1">
                    <button type="button" class="btn btn-secondary" (click)="deleteFromArray()">
                        <i class="fa fa-trash"></i>
                    </button>
                </span>
            </div>

            <!--Records-->
            <ng-template ngSwitchCase="record">
                <div *ngFor="let entry of input.type.fields" class="ml-1">
                    <label>{{ entry?.label || entry.id }} <i class="fa fa-info-circle text-muted"
                                                             *ngIf="entry.description"
                                                             [ct-tooltip]="ctt"
                                                             [tooltipPlacement]="'top'"></i>
                    </label>
                    <ct-job-editor-entry-old [prefix]="prefix + '.' + entry.id"
                                             [input]="entry"
                                             (update)="updateRecord(entry.id, $event)"
                                             [value]="value ? value[entry.id] : undefined"></ct-job-editor-entry-old>

                    <ct-tooltip-content #ctt>
                        <div class="tooltip-info">
                            {{ input.description }}
                        </div>
                    </ct-tooltip-content>
                </div>

            </ng-template>

            <!--Arrays-->
            <ng-template ngSwitchCase="array">
                <ct-job-editor-entry-old *ngFor="let entry of value; let i = index"
                                         [prefix]="prefix + '.[' + i +']'"
                                         [index]="i"
                                         [input]="arrayModifiedInput"
                                         (update)="updateArray(i, $event)"
                                         [value]="entry"></ct-job-editor-entry-old>

                <button (click)="addArrayEntry(input)"
                        type="button"
                        class="btn pl-0 btn-link no-outline no-underline-hover">
                    <i class="fa fa-plus"></i> New {{ input.type.items }}
                </button>
            </ng-template>

            <!--Unknown-->
            <ng-template ngSwitchDefault>
                <div class="alert alert-info">Unknown input type: {{ inputType }}</div>
            </ng-template>
        </div>
    `
})
export class JobEditorEntryOldComponent implements OnChanges, OnInit {

    @Input()
    input: CommandInputParameterModel;

    @Input()
    value: any;

    @Input()
    index = -1;

    @Input()
    prefix;

    @Output()
    update = new EventEmitter<any>();

    inputType: string;

    /**
     * We might want to show a warning next to a field.
     * This can happen for example if we encounter a mismatch between job value and the input type,
     * for example, an input can by File[], and the job value can be just a plain string.
     */
    warning: string;

    arrayModifiedInput;


    constructor(private inspector: EditorInspectorService) {

    }

    updateJob(data) {
        this.update.emit(data);
    }

    updateFile(data) {
        this.updateJob(data);
    }

    updateDirectory(data) {
        this.updateJob(data);
    }

    updateMap(map) {
        this.updateJob(map);
    }

    updateRecord(entryId, event) {

        const data = {...(this.value || {})};
        ObjectHelper.addProperty(data, entryId, event);
        const d = {
            ...data,
            [entryId]: Array.isArray(event) || ObjectHelper.isPrimitiveValue(event) ? event : {...event}
        };

        this.updateJob(d);
    }

    updateArray(index, data) {

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

    addArrayEntry(input) {
        this.warning         = undefined;
        const generatedEntry = JobHelper.generateMockJobData(input);
        this.updateJob((this.value || []).concat(generatedEntry.slice(0, 1)));
    }

    deleteFromArray() {
        if (this.inspector.inspectedObject.getValue() === this.value) {
            this.inspector.hide();
        }

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
                            on the “New ${this.input.type.items}” button.`;
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
            };
        }
    }
}
