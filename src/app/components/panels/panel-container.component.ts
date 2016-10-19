import {Component, Input, ViewChildren, QueryList, ElementRef} from "@angular/core";
import {Observable, BehaviorSubject, Subject} from "rxjs";
import {PanelComponent} from "./panel.component";
import {PanelHandleComponent} from "./panel-handle.component";
import {SBUserProjectsPanelComponent} from "./sb-user-projects-panel.component";
import {SBPublicAppsPanelComponent} from "./sb-public-apps-panel.component";
import {StructurePanelComponent} from "./structure-panel.component";
import {RevisionsPanelComponent} from "./revisions-panel.component";
import {LocalFilesPanelComponent} from "./local-files-panel.component";

require("./panel-container.component.scss");

@Component({
    selector: "ct-panel-container",
    directives: [
        LocalFilesPanelComponent,
        PanelComponent,
        PanelHandleComponent,
        RevisionsPanelComponent,
        SBPublicAppsPanelComponent,
        SBUserProjectsPanelComponent,
        StructurePanelComponent,
    ],
    template: `
        <template ngFor let-panel [ngForOf]="panelList | async" let-isLast="last">
            <ct-panel [size]="totalPanelSize" [class.hidden]="!panel.active">
                <ct-sb-user-projects-panel class="full-width" *ngIf="panel.id === 'sb_user_projects'"></ct-sb-user-projects-panel>
                <ct-sb-public-apps-panel class="full-width" *ngIf="panel.id === 'sb_public_apps'"></ct-sb-public-apps-panel>
                <ct-local-files-panel class="full-width" *ngIf="panel.id === 'local_files'"></ct-local-files-panel>
                <ct-structure-panel class="full-width" *ngIf="panel.id === 'structure'"></ct-structure-panel>
                <ct-revisions-panel class="full-width" *ngIf="panel.id === 'revisions'"></ct-revisions-panel>
            </ct-panel>    
            <!--<ct-panel-handle [class.hidden]="isLast || (visiblePanelCount | async) < 2"></ct-panel-handle>-->
        </template>
    `
})
export class PanelContainerComponent {

    @Input("panels")
    private panelList: Observable;

    @ViewChildren(PanelComponent)
    private panels: QueryList<PanelComponent>;

    @ViewChildren(PanelHandleComponent)
    private handles: QueryList<PanelHandleComponent>;

    private totalPanelSize: Subject<number>;

    /** Needed so we know when to display the panel separator */
    private visiblePanelCount = new BehaviorSubject<number>(0);

    constructor(private el: ElementRef) {
        this.totalPanelSize = new Subject();
        this.totalPanelSize.next(document.body.clientHeight);
    }

    ngOnInit() {
        Observable.fromEvent(document, "resize").map(_ => document.body.clientHeight).subscribe(this.totalPanelSize);
        this.panelList.map(statuses => statuses.filter(p => p.active).length).subscribe(this.visiblePanelCount);
    }

    ngAfterViewInit() {
        this.totalPanelSize.next(document.body.clientHeight);

        this.handles.forEach((handle, index) => {
            handle.onDrag.subscribe(d => {

                this.panels.first.setSize(d);
                this.panels.last.setSize(document.body.clientHeight - d);

            });
        });
    }
}