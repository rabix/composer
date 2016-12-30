import {
    Component,
    Input,
    ChangeDetectionStrategy,
    OnChanges,
    SimpleChanges,
    Output
} from "@angular/core";
import {PlatformAppRevisionEntry} from "../../../services/api/platforms/platform-api.types";
import {Subject} from "rxjs";

require("./revision-list.component.scss");

@Component({
    selector: "ct-revision-list",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ct-editor-inspector-content class="p-0">
            <div class="tc-header">Revisions</div>
            <div class="tc-body">
                
                <div class="revision-entry row pt-1 clickable"
                     (click)="selectRevision(revision)"
                     [class.active]="active === revision.number"
                     *ngFor="let revision of displayList">
                    
                    <md-progress-bar *ngIf="loadingRevision === revision" class="loading-progress" mode="indeterminate"></md-progress-bar>
                    
                    <div class="revision-number h5">
                        {{ revision.number }}
                    </div>
                    <div class="revision-info">
                        <div class="revision-note" *ngIf="revision.note">
                            {{ revision.note }}
                        </div>
                        <div class="mb-1 revision-date form-control-label">
                            by {{ revision.author }} on {{ revision.date  | date:'medium' }}  
                        </div>
                    </div>
                </div>
            </div>
        </ct-editor-inspector-content>
    `
})
export class RevisionListComponent implements OnChanges {


    @Input()
    public revisions: PlatformAppRevisionEntry[] = [];

    @Input()
    public active: number;

    @Output()
    public select = new Subject<number>();

    @Input()
    public loadingRevision;

    private displayList: {
        date: number,
        note: string,
        author: string,
        number: number
    }[] = [];

    private selectRevision(revision) {
        if (revision.number === this.active) {
            return;
        }

        this.select.next(revision.number);

        this.loadingRevision = revision;
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.loadingRevision = undefined;

        this.displayList = changes['revisions'].currentValue.map(rev => ({
            date: rev["sbg:modifiedOn"] * 1000,
            note: rev["sbg:revisionNotes"],
            author: rev["sbg:modifiedBy"],
            number: rev["sbg:revision"]
        })).sort((a, b) => ~~b.number - ~~a.number);
    }
}
