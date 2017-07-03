import {
    Component, Input, Output, EventEmitter
} from "@angular/core";
import {CommandLineToolModel} from "cwlts/models";

@Component({
    selector: "ct-tool-hints",
    template: `
        <ct-form-panel >
            <div class="tc-header">Hints</div>

            <div class="tc-body">
                
                <ct-hint-list [model]="model" 
                          [context]="context" 
                          (update)="update.next($event)"
                          [readonly]="readonly">                    
                </ct-hint-list>                
                
            </div>
        </ct-form-panel>
    `
})
export class ToolHintsComponent {

    @Input()
    model: CommandLineToolModel;

    @Input()
    readonly = false;

    @Input()
    context: any;

    @Output()
    update = new EventEmitter();

}
