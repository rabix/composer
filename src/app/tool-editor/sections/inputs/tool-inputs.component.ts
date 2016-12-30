import {Subject} from "rxjs";
import {
    Component,
    Input,
    ChangeDetectionStrategy,
    Output,
    ViewChildren,
    TemplateRef,
    QueryList
} from "@angular/core";
import {ComponentBase} from "../../../components/common/component-base";
import {CommandInputParameterModel} from "cwlts/models/d2sb";
import {EditorInspectorService} from "../../../editor-common/inspector/editor-inspector.service";


require("./input-list.component.scss");

@Component({
    selector: "ct-tool-input",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ct-form-panel [collapsed]="false">
            <span class="tc-header">
                Input ports
            </span>
            
            <div class="tc-body">
                
                <!--Blank Tool Screen-->
                <ct-blank-tool-state *ngIf="!readonly && !entries.length"
                                     [title]="'Files, parameters, and other stuff displayed in the tools command line'"
                                     [buttonText]="'Add an Input'"
                                     (buttonClick)="addEntry()">
                </ct-blank-tool-state>

                <!--List of entries-->
                <ct-tool-input-list *ngIf="entries.length" (update)="updateParent($event, i)" 
                    [entries]="entries" 
                    [location]="location" 
                    [context]="context" 
                    [readonly]="readonly">
                </ct-tool-input-list>
                
            </div>
        </ct-form-panel>
    `
})
export class ToolInputsComponent extends ComponentBase {

    @Input()
    public entries: CommandInputParameterModel[] = [];

    /** Model location entry, used for tracing the path in the json document */
    @Input()
    public location = "";

    /** Context in which expression should be evaluated */
    @Input()
    public context: {$job: any};

    @Input()
    public readonly = false;

    @Output()
    public readonly update = new Subject();

    @ViewChildren("inspector", {read: TemplateRef})
    private inspectorTemplate: QueryList<TemplateRef<any>>;

    constructor(private inspector: EditorInspectorService) {
        super();
    }

    private addEntry() {

        const newEntryLocation = `${this.location}[${this.entries.length}]`;
        const newEntry = new CommandInputParameterModel(newEntryLocation, undefined);
        newEntry.type.type = "File";
        const entries = this.entries.concat(newEntry);
        this.update.next(entries);

        this.inspectorTemplate.changes
            .take(1)
            .delay(1)
            .map(list => list.last)
            .subscribe(templateRef => {
                this.inspector.show(templateRef, newEntry);
            });
    }

    private updateParent(fields) {

        this.entries = fields.slice();
        this.update.next(this.entries.slice());

    }

}
