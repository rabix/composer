import {Component, EventEmitter, Input, Output, QueryList, TemplateRef, ViewChildren} from "@angular/core";
import {CommandLineToolModel} from "cwlts/models";
import {EditorInspectorService} from "../../../editor-common/inspector/editor-inspector.service";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
    selector: "ct-argument-list",
    styleUrls: ["./argument-list.component.scss"],
    template: `
        <ct-form-panel [collapsed]="false">
            <span class="tc-header">
                Arguments
            </span>

            <div class="tc-body">

                <div>

                    <!--Blank Tool Screen-->
                    <ct-blank-tool-state *ngIf="!readonly && !model.arguments.length"
                                         data-test="tool-add-argument-button"
                                         [buttonText]="'Add an Argument'"
                                         [description]="blankStateDescription"
                                         (buttonClick)="addEntry()">
                    </ct-blank-tool-state>

                    <div *ngIf="readonly && !model.arguments.length" class="text-xs-center">
                        This tool doesn't specify any arguments
                    </div>

                    <!--List Header Row-->
                    <div class="editor-list-title" [class.editable]="!readonly" *ngIf="!!model.arguments.length">
                        <div class="col-sm-4">Value</div>
                        <div class="col-sm-3">Prefix</div>
                        <div class="col-sm-3">Separate</div>
                        <div class="col-sm-2">#</div>
                    </div>

                    <!--Argument List Entries-->
                    <ul class="editor-list">

                        <!--List Entry-->
                        <li *ngFor="let entry of model.arguments; let i = index"
                            class="input-list-items">

                            <!--List item-->
                            <div class="form-control editor-list-item clickable"
                                 [ct-validation-class]="entry"
                                 [ct-editor-inspector]="inspector"
                                 [ct-editor-inspector-target]="entry.loc">

                                <!--Tooltip for Value-->
                                <ct-tooltip-content #ctt>
                                    <span *ngIf="!entry.valueFrom || !entry.valueFrom?.isExpression">
                                    {{ entry.toString() }}
                                    </span>

                                    <ct-code-preview *ngIf="ctt.isIn && entry.valueFrom && entry.valueFrom.isExpression"
                                                     (viewReady)="ctt.show()"
                                                     [content]="entry.toString()"></ct-code-preview>
                                </ct-tooltip-content>

                                <!--Value Column-->
                                <div class="col-sm-4 ellipsis" [ct-tooltip]="ctt" [tooltipPlacement]="'top'">
                                    <ct-validation-preview [entry]="entry"></ct-validation-preview>
                                    <span>
                                    {{ entry.toString() }}
                                </span>
                                </div>

                                <!--Prefix Column-->
                                <div class="col-sm-3 ellipsis" [title]="entry.prefix">
                                    <span *ngIf="entry.prefix">{{ entry.prefix }}</span>
                                    <i *ngIf="!entry.prefix" class="fa fa-fw fa-times"></i>
                                </div>

                                <!--Separate Column-->
                                <div class="col-sm-3 ellipsis">
                                    <i class="fa fa-fw"
                                       [ngClass]="{'fa-check': entry.separate, 'fa-times': !entry.separate}">
                                    </i>
                                </div>

                                <!--Position Column-->
                                <div class="ellipsis" [ngClass]="{
                                'col-sm-1': !readonly,
                                'col-sm-2': readonly
                            }">{{ entry.position || 0 }}
                                </div>
                            </div>

                            <!--Actions Column-->
                            <div *ngIf="!readonly" class="remove-icon">
                                <i [ct-tooltip]="'Delete'"
                                   class="fa fa-trash clickable"
                                   (click)="removeEntry(i)"></i>
                            </div>

                            <!--Object Inspector Template -->
                            <ng-template #inspector>
                                <ct-editor-inspector-content>
                                    <div class="tc-header">{{ entry.loc || "Argument"}}</div>
                                    <div class="tc-body">
                                        <ct-argument-inspector
                                            (save)="update.emit(model.arguments)"
                                            [argument]="entry"
                                            [readonly]="readonly"
                                            [context]="context">
                                        </ct-argument-inspector>
                                    </div>
                                </ct-editor-inspector-content>
                            </ng-template>
                        </li>
                    </ul>

                </div>

                <!--Add entry link-->
                <button *ngIf="!readonly && !!model.arguments.length"
                        (click)="addEntry()"
                        type="button"
                        class="btn pl-0 btn-link no-outline no-underline-hover"
                        data-test="tool-add-argument-button-small">
                    <i class="fa fa-plus"></i> Add an Argument
                </button>
            </div>
        </ct-form-panel>
    `
})
export class ArgumentListComponent extends DirectiveBase {

    @Input()
    readonly = false;

    /** Model location entry, used for tracing the path in the json document */
    @Input()
    location = "";

    /** Context in which expression should be evaluated */
    @Input()
    context;

    @Input()
    model: CommandLineToolModel;

    @Output()
    readonly update = new EventEmitter();

    @ViewChildren("inspector", {read: TemplateRef})
    inspectorTemplate: QueryList<TemplateRef<any>>;

    blankStateDescription = `Parameters or options that are hard-coded for every execution of the tool. For example, you may 
    want to use a fixed name for an output file, so the output file name would be an argument not an input port.`;

    constructor(public inspector: EditorInspectorService, private modal: ModalService) {
        super();
    }

    removeEntry(index) {
        this.modal.delete("argument").then(() => {

            if (this.inspector.isInspecting(this.model.arguments[index].loc)) {
                this.inspector.hide();
            }

            this.model.removeArgument(this.model.arguments[index]);
            this.update.emit(this.model.arguments);
        }, err => console.warn);
    }

    addEntry() {
        const newEntry = this.model.addArgument({});
        this.update.emit(this.model.arguments);

        this.inspectorTemplate.changes
            .take(1)
            .delay(1)
            .map(list => list.last)
            .subscribe(templateRef => {
                this.inspector.show(templateRef, newEntry.loc);
            });
    }
}
