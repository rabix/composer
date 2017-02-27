import {Component, ElementRef, Input, QueryList, ViewChildren, ViewEncapsulation} from "@angular/core";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {PanelComponent} from "./panel.component";
@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-panel-container",
    styleUrls: ["./panel-container.component.scss"],
    template: `
        <template ngFor let-panel [ngForOf]="panelList | async" let-isLast="last">
            <ct-panel [size]="totalPanelSize" [class.hidden]="!panel.active">
                <ct-sb-user-projects-panel class="full-width" *ngIf="panel.id === 'sb_user_projects'"></ct-sb-user-projects-panel>
                <ct-sb-public-apps-panel class="full-width" *ngIf="panel.id === 'sb_public_apps'"></ct-sb-public-apps-panel>
                <ct-local-files-panel class="full-width" *ngIf="panel.id === 'local_files'"></ct-local-files-panel>
                <ct-structure-panel class="full-width" *ngIf="panel.id === 'structure'"></ct-structure-panel>

            </ct-panel>
        </template>
    `
})
export class PanelContainerComponent {

    @Input("panels")
    public panelList: Observable<{ id: string, active: boolean }[]>;

    @ViewChildren(PanelComponent)
    private panels: QueryList<PanelComponent>;

    public totalPanelSize: Subject<number>;

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
    }
}
