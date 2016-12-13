import {Subject} from "rxjs";
import {Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges, Output} from "@angular/core";
import {ComponentBase} from "../../../components/common/component-base";
import {CommandArgumentModel} from "cwlts/models/d2sb";
import {CommandLineBindingModel} from "cwlts/models/d2sb/CommandLineBindingModel";
import {EditorInspectorService} from "../../../editor-common/inspector/editor-inspector.service";

require("./argument-list.component.scss");

@Component({
    selector: "ct-argument-list",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ct-form-panel [collapsed]="false">
            <span class="tc-header">
                Arguments
            </span>
            
            <div class="tc-body">
                <ct-blank-tool-state *ngIf="!readonly && !arguments.length"
                                     [title]="'Command line arguments for your tool'"
                                     [buttonText]="'Add an Argument'"
                                     (buttonClick)="addEntry()">
                </ct-blank-tool-state>
                
                <div *ngIf="arguments.length" class="container">
                    <div class="gui-section-list-title row">
                        <div class="col-sm-4">Value</div>
                        <div class="col-sm-3">Prefix</div>
                        <div class="col-sm-3">Separate</div>
                        <div class="col-sm-2">#</div>
                    </div>
                
                    <ul class="gui-section-list">
                        <li *ngFor="let entry of arguments; let i = index"
                            [ct-editor-inspector]="inspector"
                            [ct-editor-inspector-target]="entry.model"
                            class="gui-section-list-item clickable validatable row">
                            
                            <ct-tooltip-content #ctt>
                                <span *ngIf="entry.value && entry.value[0] !== '{'">{{ entry.value }}</span>
                                
                                <ct-code-preview *ngIf="ctt.isIn && entry.value && entry.value[0] === '{'"
                                                 (viewReady)="ctt.show()"
                                                 [content]="entry.value"></ct-code-preview>
                                
                            </ct-tooltip-content>
                            <div class="col-sm-4 ellipsis" [ct-tooltip]="ctt" [tooltipPlacement]="'top'">
                                {{ entry.value }}
                            </div>
                            
                            <div class="col-sm-3 ellipsis" [title]="entry.prefix">
                                <span *ngIf="entry.prefix">{{ entry.prefix }}</span>
                                <i *ngIf="!entry.prefix" class="fa fa-fw fa-times"></i>
                            </div>

                            <div class="col-sm-3 ellipsis">
                                    <i class="fa fa-fw" 
                                        [ngClass]="{'fa-check': entry.separate, 'fa-times': !entry.separate}">                        
                                    </i>
                            </div>
                            
                            <div class="ellipsis" [ngClass]="{
                                'col-sm-1': !readonly,
                                'col-sm-2': readonly
                            }" >{{ entry.position }}</div>
                            
                            <div *ngIf="!readonly" class="col-sm-1 align-right">
                                <i [ct-tooltip]="'Delete'"
                                   class="fa fa-trash text-hover-danger" 
                                   (click)="removeEntry(entry.model)"></i>
                            </div>
                            
                            <!--Object Inspector Template -->
                            <template #inspector>
                                <ct-editor-inspector-content>
                                    <div class="tc-header">Argument</div>
                                    <div class="tc-body">
                                        <ct-argument-inspector 
                                            (save)="updateArgument($event, entry.model)" 
                                            [input]="entry.model"
                                            [context]="context">                                            
                                        </ct-argument-inspector>
                                    </div>
                                </ct-editor-inspector-content>
                            </template>
                        </li>
                    </ul>
                
                </div>
            
                
                <button *ngIf="!readonly && arguments.length" 
                        (click)="addEntry()" 
                        type="button" 
                        class="btn pl-0 btn-link no-outline no-underline-hover">
                    <i class="fa fa-plus"></i> Add an Argument
                </button>
            </div>
        </ct-form-panel>
    `
})
export class ArgumentListComponent extends ComponentBase implements OnChanges {

    @Input()
    public entries: CommandArgumentModel[] = [];

    @Input()
    public readonly = false;

    /** Model location entry, used for tracing the path in the json document */
    @Input()
    public location = "";

    private arguments: {
        value: string,
        prefix: string,
        position: number,
        separate: boolean,
        model: CommandArgumentModel
    }[] = [];

    @Input()
    public context;

    @Output()
    public readonly update = new Subject();

    constructor(private inspector: EditorInspectorService) {
        super();
    }

    private removeEntry(entry) {
        const index = this.entries.findIndex(x => x == entry);

        if (this.inspector.isInspecting(entry)) {
            this.inspector.hide();
        }

        const entries = this.entries.slice(0, index).concat(this.entries.slice(index + 1));
        this.update.next(entries);
    }

    private repos() {
        console.log("Should reposition");
    }

    private addEntry() {
        const newEntryLocation = `${this.location}[${this.entries.length}]`;
        const newEntry = new CommandArgumentModel({}, newEntryLocation);
        const entries  = this.entries.concat(newEntry);
        this.update.next(entries);
    }

    ngOnChanges(changes: SimpleChanges): void {
        debugger;
        this.arguments = changes["entries"].currentValue.map(entry => ({
            value: typeof entry.valueFrom.value === "object" ? entry.valueFrom.value.script : entry.valueFrom.value,
            prefix: entry.arg.prefix,
            position: entry.arg.position || 0,
            separate: !!entry.arg.separate,
            model: entry,
        })).sort((a, b) => a.position - b.position);
    }

    private updateArgument(form: {position: number, prefix: string, separator: boolean, valueFrom: any}, entry: CommandArgumentModel) {

        const argument = this.entries.find(x => entry == x);

        const stt = new CommandLineBindingModel({
            position: form.position,
            separate: form.separator,
            prefix: form.prefix,
            valueFrom: form.valueFrom.serialize()
        }, argument.loc);

        argument.updateBinding(stt);

        this.update.next(this.entries.slice());
    }
}
