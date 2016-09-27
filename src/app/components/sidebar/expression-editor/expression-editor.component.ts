import {Component, ElementRef, ViewChild, OnInit, OnDestroy} from "@angular/core";
import {ExpressionEditor} from "./expression-editor";
import {Observable} from "rxjs/Observable";
import {EventHubService} from "../../../services/event-hub/event-hub.service";
import {ExpressionEditorData} from "../../../models/expression-editor-data.model";
import {OpenExpressionEditor} from "../../../action-events/index";
import {SandboxService, SandboxResponse} from "../../../services/sandbox/sandbox.service";
import {Subscription} from "rxjs/Subscription";
import Document = AceAjax.Document;
import IEditSession = AceAjax.IEditSession;
import TextMode = AceAjax.TextMode;

require ("./expression-editor.component.scss");

@Component({
    selector: "expression-editor",
    template: `
         <div class="expression-editor-component">
                <div #ace class="ace-editor"></div>
                
                <div class="expression-result-container">
                    <div class="code-preview">
                         Code preview:
                        <div>
                            {{evaluatedExpression}}
                        </div>
                    </div>
                        
                    <button type="button" 
                            class="execute-btn"
                            (click)="execute()">Execute</button>
                </div>
         </div>
 `
})
export class ExpressionEditorComponent implements OnInit, OnDestroy {

    /** Expression stream coming form the tool */
    private expressionStream: Observable<string>;

    /** Update action to be passed to the event hub */
    private updateAction: Function;

    /** Reference to the element in which we want to instantiate the Ace editor */
    @ViewChild("ace")
    private aceContainer: ElementRef;

    private editor: ExpressionEditor;

    /** Code String that we send to the sandbox */
    private codeToEvaluate: string;

    /** Result we get back from the sandbox */
    private evaluatedExpression: string;

    private sandboxService: SandboxService;

    private subs: Subscription[];

    constructor(private eventHub: EventHubService) {
        this.subs = [];
    }

    ngOnInit(): any {
        let openExpressionEditor = this.eventHub.onValueFrom(OpenExpressionEditor)
            .subscribe((data:ExpressionEditorData) => {
                this.initSandbox();

                this.expressionStream = data.expression;
                this.updateAction = data.updateAction;

                this.editor = new ExpressionEditor(ace.edit(this.aceContainer.nativeElement), this.expressionStream);
                this.listenToExpressionChanges();
            });

        this.subs.push(openExpressionEditor);
    }

    private listenToExpressionChanges(): void {
        let expressionChanges = this.editor.expressionChanges.subscribe(expression => {
            this.codeToEvaluate = expression;
            this.eventHub.publish(this.updateAction(expression));
        });

        this.subs.push(expressionChanges);
    }

    private initSandbox(): void {
        this.sandboxService = new SandboxService();
        this.codeToEvaluate = '';
        this.evaluatedExpression = '';

        let expressionResult = this.sandboxService.expressionResult
            .filter(result => result !== undefined)
            .subscribe((result: SandboxResponse) => {

                if (result.error) {
                    //TODO: make error message nicer on the UI
                    this.evaluatedExpression = result.error;
                } else {
                    this.evaluatedExpression = result.output;
                }
            });

        this.subs.push(expressionResult);
    }

    private execute(): void {
        this.sandboxService.submit(this.codeToEvaluate);
    }

    ngOnDestroy(): void {
        if (this.editor) {
            this.editor.dispose();
        }
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
