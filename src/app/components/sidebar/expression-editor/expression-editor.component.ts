import {Component, ElementRef, ViewChild, Input} from "@angular/core";
import {ExpressionEditor} from "./expression-editor";
import {Observable} from "rxjs/Observable";
import Document = AceAjax.Document;
import IEditSession = AceAjax.IEditSession;
import TextMode = AceAjax.TextMode;
import {EventHubService} from "../../../services/event-hub/event-hub.service";

require ("./expression-editor.component.scss");

@Component({
    selector: "expression-editor",
    template: `
         <div class="expression-editor-component">
                <div #ace class="ace-editor"></div>
         </div>
 `
})
export class ExpressionEditorComponent {
    @Input()
    private expression: Observable<string>;

    @Input()
    private updateAction: any;

    /** Reference to the element in which we want to instantiate the Ace editor */
    @ViewChild("ace")
    private aceContainer: ElementRef;

    private editor: ExpressionEditor;

    constructor(private eventHub: EventHubService) { }

    ngOnInit(): any {
        this.editor = new ExpressionEditor(ace.edit(this.aceContainer.nativeElement), this.expression);

        this.editor.expressionChanges.subscribe(expression => {
            this.eventHub.publish(this.updateAction(expression));
        });
    }
}
