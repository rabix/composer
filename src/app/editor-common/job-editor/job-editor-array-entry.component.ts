import {ChangeDetectionStrategy, Component, Input, Output, EventEmitter} from "@angular/core";
import {InputParameterTypeModel} from "cwlts/models/d2sb";
@Component({
    selector: "ct-job-editor-entry",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div [ngSwitch]="input.type.type" class="form-group">
            <label>{{ input.id }}:</label>
            
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
                <div class="clickable" [ct-editor-inspector]="fileInspector">
                    <div class="input-group">
                        <input readonly class="form-control" [value]="value?.path"/>
                        <span class="input-group-btn">
                            <button type="button" class="btn btn-secondary">
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
                <ct-job-editor-array *ngFor="let entry of value" [input]="{...input}" [value]="entry"></ct-job-editor-array>
            </template>
            
            
            <!--Unknown-->
            <template ngSwitchDefault>
                <div class="alert alert-info">Unknown input type: {{ input.type.type}}</div>
            </template>
            
            <div class="form-control-label">{{ input.description }}</div>
        </div>
    `
})
export class JobEditorEntryComponent {

    @Input()
    public input: InputParameterTypeModel;

    @Input()
    public value: any;

    @Output()
    public update = new EventEmitter<any>();

    public updateJob(data) {
        this.update.emit(data);
    }
}
