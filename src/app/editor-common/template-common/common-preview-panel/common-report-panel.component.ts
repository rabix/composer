import {AfterViewInit, Component, ElementRef, HostBinding, Input, ViewChild, OnInit} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {DomEventService} from "../../../services/dom/dom-event.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {WorkflowEditorComponent} from "../../../workflow-editor/workflow-editor.component";
import {AppEditorBase} from "../../app-editor-base/app-editor-base";
import {ExecutionStatusComponent} from "../../../execution/components/execution-status/execution-status.component";
import {appSelector} from "../../../execution/reducers/selectors";
import {AppExecution} from "../../../execution/models";
import {map} from "rxjs/operators";

@Component({
    selector: "ct-common-report-panel",
    template: `

        <div class="panel-header" #resizeHandle>
            <span class="panel-controls pull-right">
                <!--<i class="fa fa-times panel-close" (click)="host.reportPanel = undefined"></i>-->
            </span>
        </div>


        <!--Common Execution Preview-->
        <ct-execution-status [hidden]="host.reportPanel !== 'execution'" #executionPreview
                             [execution]="appProgressSlice | async"
                             [appID]="host.tabData.id">
        </ct-execution-status>


        <!--Common Validation Report-->
        <ct-validation-report *ngIf="host.reportPanel === 'validation'"
                              [errors]="host.validationState.errors"
                              [warnings]="host.validationState.warnings">
        </ct-validation-report>

        <!--App type-specific additional panels-->
        <ng-content></ng-content>
    `,
    styleUrls: ["./common-report-panel.component.scss"],
})
export class CommonReportPanelComponent extends DirectiveBase implements OnInit, AfterViewInit {

    @Input()
    host: AppEditorBase;

    @HostBinding("style.flexBasis.px")
    private flexBasis = 160;

    @ViewChild("resizeHandle")
    resizeHandle: ElementRef;

    appType: string;

    @ViewChild("executionPreview", {read: ExecutionStatusComponent})
    private appExecutionPreview: ExecutionStatusComponent;

    appProgressSlice: Observable<Partial<AppExecution>>;

    constructor(private domEvents: DomEventService, private element: ElementRef) {
        super();
    }

    ngOnInit() {

        this.appType = this.host instanceof WorkflowEditorComponent ? "Workflow" : "CommandLineTool";

        this.appProgressSlice = this.host.store.pipe(
            map(appSelector(this.host.tabData.id)),
        );

    }

    ngAfterViewInit() {
        this.attachResizeListener();
    }

    private attachResizeListener() {
        const resizeHandle = this.resizeHandle.nativeElement as HTMLDivElement;
        const container    = this.element.nativeElement.parentElement;

        this.domEvents.onDrag(resizeHandle).subscribeTracked(this, (movement: Observable<MouseEvent>) => {

            const originalFlexBasis = this.flexBasis;

            const down = movement.take(1);
            const up   = movement.last().take(1);
            const move = movement.skip(1).takeUntil(up);

            move.withLatestFrom(down, (outer, inner) => inner.clientY - outer.clientY)
                .subscribeTracked(this, deltaY => {
                    const update = originalFlexBasis + deltaY;

                    const isAboveBottomMargin = update > 50;
                    const isBelowTopMargin    = update < (container.clientHeight - 80);

                    if (isAboveBottomMargin && isBelowTopMargin) {
                        this.flexBasis = update;
                    }

                });


        });
    }


}
