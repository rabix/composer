import {
    ChangeDetectionStrategy,
    Component,
    Input,
    Output,
    EventEmitter,
    SimpleChanges,
    OnChanges, ChangeDetectorRef
} from "@angular/core";
import {InputParameterTypeModel} from "cwlts/models/d2sb";
@Component({
    selector: "ct-job-editor-entry",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div [ngSwitch]="input.type.type" class="form-group">
            <!--Enums-->
            <template ngSwitchCase="enum">
                <select [value]="value" class="form-control">
                    <option *ngFor="let val of input.type.symbols" [value]="val"> {{ val }}</option>
                </select>
            </template>
            
            <!--Numbers-->
            <template ngSwitchCase="int">
                <input type="number" class="form-control" [value]="value"/>
            </template>
            <template ngSwitchCase="float">
                <input type="number" class="form-control" [value]="value"/>
            </template>
            
            <!--Strings-->
            <template ngSwitchCase="string">
                <input class="form-control" [value]="value"/>
            </template>
            
            <!--Booleans-->
            <template ngSwitchCase="boolean">
                <ct-toggle-slider class="pull-right" [value]="value"></ct-toggle-slider>
            </template>
            
            <!--Files-->
            <template ngSwitchCase="File">
                <div class="clickable" >
                    <div class="input-group">
                        <input readonly class="form-control" [value]="value?.path || ''"/>
                        <span class="input-group-btn">
                            <button type="button" class="btn btn-secondary" 
                                    [ct-editor-inspector]="fileInspector">
                                <i class="fa fa-ellipsis-h"></i>
                            </button>
                        </span>  
                    </div>
                </div>
                
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
            
            <!--Records-->
            <!--Arrays-->
            <template ngSwitchCase="array">
                <ct-job-editor-entry *ngFor="let entry of value; let i = index" 
                                     [input]="arrayModifiedInput" 
                                     (update)="updateArray(i, $event)"
                                     [value]="entry"></ct-job-editor-entry>
                                     
                <button (click)="addArrayEntry({})" 
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
    public input: InputParameterTypeModel;

    @Input()
    public value: any;

    @Output()
    public update = new EventEmitter<any>();

    public arrayModifiedInput;

    public updateJob(data) {
        this.update.emit(data);
    }

    public updateArray(index, data) {
        // This is tricky.
        // We need to update the original value in place, and cant replace its reference because
        // of the object inspector, which would still point to the previous entry.
        // We can't close and reopen the inspector because it would break the control focus.
        this.value[index] = Object.assign(this.value[index], data);

        this.updateJob(this.value.slice());

    }

    private addArrayEntry(data){
        this.updateJob(this.value.concat(data));
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.input.type.type === "array") {
            this.arrayModifiedInput = {
                ...this.input,
                type: {...this.input.type, type: this.input.type.items}
            }
        }
    }
}
