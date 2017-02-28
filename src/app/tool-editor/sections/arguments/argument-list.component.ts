import {Subject} from "rxjs";
import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnChanges,
    Output,
    QueryList,
    SimpleChanges,
    TemplateRef,
    ViewChildren,
    ViewEncapsulation
} from "@angular/core";
import {ComponentBase} from "../../../components/common/component-base";
import {CommandArgumentModel} from "cwlts/models/d2sb";
import {CommandLineBindingModel} from "cwlts/models/d2sb/CommandLineBindingModel";
import {EditorInspectorService} from "../../../editor-common/inspector/editor-inspector.service";
import {ModalService} from "../../../components/modal/modal.service";
import {noop} from "../../../lib/utils.lib";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-argument-list",
    styleUrls: ["./argument-list.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ct-form-panel [collapsed]="false">
            <span class="tc-header">
                Arguments
            </span>

            <div class="tc-body">

                <div class="container">

                    <!--Blank Tool Screen-->
                    <ct-blank-tool-state *ngIf="!readonly && !arguments.length"
                                         [title]="'Command line arguments for your tool'"
                                         [buttonText]="'Add an Argument'"
                                         (buttonClick)="addEntry()">
                    </ct-blank-tool-state>

                    <!--List Header Row-->
                    <div class="gui-section-list-title row" *ngIf="arguments.length">
                        <div class="col-sm-4">Value</div>
                        <div class="col-sm-3">Prefix</div>
                        <div class="col-sm-3">Separate</div>
                        <div class="col-sm-2">#</div>
                    </div>

                    <!--Argument List Entries-->
                    <ul class="gui-section-list">

                        <!--List Entry-->
                        <li *ngFor="let entry of arguments; let i = index"
                            class="input-list-items container">

                            <div class="gui-section-list-item clickable row"
                                 [ct-validation-class]="entry.validation"
                                 [ct-editor-inspector]="inspector"
                                 [ct-editor-inspector-target]="entry.loc">

                                <!--Tooltip for Value-->
                                <ct-tooltip-content #ctt>
                                <span *ngIf="entry.valueFrom && !entry.valueFrom.isExpression">
                                {{ entry.toString() }}
                                </span>

                                    <ct-code-preview *ngIf="ctt.isIn && entry.valueFrom && entry.valueFrom.isExpression"
                                                     (viewReady)="ctt.show()"
                                                     [content]="entry.toString()"></ct-code-preview>
                                </ct-tooltip-content>

                                <!--Value Column-->
                                <div class="col-sm-4 ellipsis" [ct-tooltip]="ctt" [tooltipPlacement]="'top'">
                                    <ct-validation-preview [entry]="entry.validation"></ct-validation-preview>
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

                                <!--Actions Column-->
                                <div *ngIf="!readonly" class="col-sm-1 align-right">
                                    <i [ct-tooltip]="'Delete'"
                                       class="fa fa-trash text-hover-danger"
                                       (click)="removeEntry(entry)"></i>
                                </div>

                            </div>

                            <!--Object Inspector Template -->
                            <template #inspector>
                                <ct-editor-inspector-content>
                                    <div class="tc-header">{{ entry.loc || "Argument"}}</div>
                                    <div class="tc-body">
                                        <ct-argument-inspector
                                            (save)="updateArgument($event, entry)"
                                            [argument]="entry"
                                            [readonly]="readonly"
                                            [context]="context">
                                        </ct-argument-inspector>
                                    </div>
                                </ct-editor-inspector-content>
                            </template>
                        </li>
                    </ul>

                </div>

                <!--Add entry link-->
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

    private arguments: CommandArgumentModel[] = [];

    /** Context in which expression should be evaluated */
    @Input()
    public context;

    @Output()
    public readonly update = new Subject();

    @ViewChildren("inspector", {read: TemplateRef})
    private inspectorTemplate: QueryList<TemplateRef<any>>;

    constructor(private inspector: EditorInspectorService, private modal: ModalService) {
        super();
    }

    private removeEntry(entry) {
        this.modal.confirm({
            title: "Really Remove?",
            content: `Are you sure that you want to remove this argument?`,
            cancellationLabel: "No, keep it",
            confirmationLabel: "Yes, remove it"
        }).then(() => {
            const index = this.entries.findIndex(x => x == entry);

            if (this.inspector.isInspecting(entry.loc)) {
                this.inspector.hide();
            }

            const entries = this.entries.slice(0, index).concat(this.entries.slice(index + 1));
            this.update.next(entries);
        }, noop);
    }

    private addEntry() {

        const newEntryLocation = `${this.location}[${this.entries.length}]`;
        const newEntry = new CommandArgumentModel({}, newEntryLocation);
        const entries = this.entries.concat(newEntry);
        this.update.next(entries);

        this.inspectorTemplate.changes
            .take(1)
            .delay(1)
            .map(list => list.last)
            .subscribe(templateRef => {
                this.inspector.show(templateRef, newEntry.loc);
            });
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.arguments = changes["entries"].currentValue.map(entry => entry)
            .sort((a, b) => a.position - b.position);
    }

    private updateArgument(form: { position: number, prefix: string, separate: boolean, valueFrom: any },
                           entry: CommandArgumentModel) {

        const argument = this.entries.find(x => entry == x);

        argument.updateBinding(new CommandLineBindingModel({
            position: form.position,
            separate: form.separate,
            prefix: form.prefix,
            valueFrom: form.valueFrom.serialize()
        }, argument.loc));

        this.update.next(this.entries.slice());

    }
}
