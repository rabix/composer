import {
    ChangeDetectionStrategy,
    Component,
    Input,
    Output,
    EventEmitter,
    SimpleChanges,
    OnChanges
} from "@angular/core";
import {CommandInputParameterModel} from "cwlts/models/d2sb";
import {JobHelper} from "cwlts/models/helpers/JobHelper";

@Component({
    selector: "ct-job-editor-entry",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="alert alert-warning form-control-label" *ngIf="warning">{{ warning }}</div>
        <div [ngSwitch]="input.type.type" class="form-group">
        
            <!--Each leaf field will be wrapped as an input group-->
            <!--Nested fields below should not be wrapped into other container elements-->
            <!--because it will break size and positioning-->
            <div class="input-group">
            
                <!--Enums-->
                <template ngSwitchCase="enum">
                    <select [value]="value" class="form-control" [attr.inputId]="input.id" [attr.arrayIndex]="index">
                        <option *ngFor="let val of input.type.symbols" [value]="val"> {{ val }}</option>
                    </select>
                </template>
                
                <!--Numbers-->
                <template ngSwitchCase="int">
                    <input [attr.inputId]="input.id" [attr.arrayIndex]="index" type="number" class="form-control" [value]="value"/>
                </template>
                <template ngSwitchCase="float">
                    <input [attr.inputId]="input.id" [attr.arrayIndex]="index" type="number" class="form-control" [value]="value"/>
                </template>
                
                <!--Strings-->
                <template ngSwitchCase="string">
                    <input [attr.inputId]="input.id" [attr.arrayIndex]="index" class="form-control" [value]="value"/>
                </template>
                
                <!--Booleans-->
                <template ngSwitchCase="boolean">
                    <ct-toggle-slider [attr.inputId]="input.id" [attr.arrayIndex]="index" class="pull-right" [value]="value"></ct-toggle-slider>
                </template>
                
                <!--Files-->
                <template ngSwitchCase="File">
                    <input [attr.inputId]="input.id" [attr.arrayIndex]="index" [attr.jobPropPath]="'path'" class="form-control" [value]="value?.path"/>
                    <span class="input-group-btn">
                        <button type="button" class="btn btn-secondary" 
                                [ct-editor-inspector]="fileInspector">
                            <i class="fa fa-ellipsis-h"></i>
                        </button>
                    </span>  
                    
                    <template #fileInspector>
                        <ct-editor-inspector-content>
                            <div class="tc-header">{{ input.id }}</div>
                            <div class="tc-body">
                                <ct-file-input-inspector [input]="value || {}" 
                                                         (update)="updateJob($event)">
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
            
            
            
            
            
            <!--Arrays-->
            <template ngSwitchCase="array">
                <ct-job-editor-entry *ngFor="let entry of value; let i = index" 
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
                <div class="alert alert-info">Unknown input type: {{ input.type.type}}</div>
            </template>
            
            
        </div>
    `
})
export class JobEditorEntryComponent implements OnChanges {

    @Input()
    public input: CommandInputParameterModel;

    @Input()
    public value: any;

    @Input()
    public index = -1;

    @Output()
    public update = new EventEmitter<any>();


    /**
     * Entry might have a warning attached to it.
     * This can happen for example if we encounter a mismatch between job value and the input type,
     * for example, an input can by File[], and the job value can be just a plain string.
     */
    public warning: string;

    public arrayModifiedInput;

    public updateJob(data) {
        this.update.emit(data);
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
        this.value[index] = Object.assign(this.value[index], data);

        this.updateJob(this.value.slice());
    }

    private addArrayEntry(input) {
        this.warning         = undefined;
        const generatedEntry = JobHelper.getJobPart(input);
        this.updateJob((this.value || []).concat(generatedEntry.slice(0, 1)));
    }

    private deleteFromArray() {
        this.updateJob(undefined);
    }

    ngOnInit() {
        if (this.input.type.type === "array" && !Array.isArray(this.value)) {
            this.value = [];
            this.addArrayEntry(this.input);
            this.warning = `Type mismatch: the default job value for this input 
                            is of type “${typeof this.value}”, but the input is declared 
                            as “${this.input.type.type}”. 
                            You can generate a new set of test data for this input by clicking 
                            on the “New ${this.input.type.items}” button.`
        }
    }

    ngOnChanges(changes: SimpleChanges) {

        if (this.input.type.type === "array") {
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
