import {Component, ElementRef, ViewChild} from "@angular/core";
import {ExpressionEditor} from "./expression-editor";
import {Observable} from "rxjs/Observable";
import {EventHubService} from "../../../services/event-hub/event-hub.service";
import {ExpressionEditorData} from "../../../models/expression-editor-data.model";
import {OpenExpressionEditor} from "../../../action-events/index";
import Document = AceAjax.Document;
import IEditSession = AceAjax.IEditSession;
import TextMode = AceAjax.TextMode;

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

    private expression: Observable<string>;

    private updateAction: Function;

    /** Reference to the element in which we want to instantiate the Ace editor */
    @ViewChild("ace")
    private aceContainer: ElementRef;

    private editor: ExpressionEditor;

    constructor(private eventHub: EventHubService) { }

    ngOnInit(): any {

        this.eventHub.onValueFrom(OpenExpressionEditor)
            .subscribe((data: ExpressionEditorData) => {
                this.expression = data.expression;
                this.updateAction = data.updateAction;

                this.editor = new ExpressionEditor(ace.edit(this.aceContainer.nativeElement), this.expression);

                this.editor.expressionChanges.subscribe(expression => {
                    this.eventHub.publish(this.updateAction(expression));
                });
            });
    }
}
