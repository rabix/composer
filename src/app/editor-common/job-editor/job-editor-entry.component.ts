import {
    ChangeDetectionStrategy,
    Component,
    Input,
    Output,
    EventEmitter,
    SimpleChanges,
    OnChanges
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
                <div class="clickable" [ct-editor-inspector]="fileInspector">
                    <div class="input-group">
                        <input readonly class="form-control" [value]="value?.path || ''"/>
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
                <ct-job-editor-entry *ngFor="let entry of value; let i = index" 
                                     [input]="arrayModifiedInput" 
                                     (update)="updateArray(i, $event)"
                                     [value]="entry"></ct-job-editor-entry>
                                     
                <button (click)="duplicateArrayEntry(value)" 
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
        console.log("Updating job from", this.input, "with", data);
        this.update.emit(data);
    }

    public updateArray(index, data) {
        const update = this.value.slice(0, index).concat(data, this.value.slice(index + 1));
        this.updateJob(update);
    }

    private duplicateArrayEntry(entry){
        this.updateJob(this.value.concat({}));
    }

    ngOnChanges(changes: SimpleChanges) {
        console.log("Changes in entry component", changes);
        if (this.input.type.type === "array") {
            this.arrayModifiedInput = {
                ...this.input,
                type: {...this.input.type, type: this.input.type.items}
            }
        }
    }
}
