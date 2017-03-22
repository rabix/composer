import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    ViewEncapsulation
} from "@angular/core";
import {PlatformAppRevisionEntry} from "../../../services/api/platforms/platform-api.types";
import {Subject} from "rxjs/Subject";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-revision-list",
    styleUrls: ["./revision-list.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ct-editor-inspector-content class="p-0">
            <div class="tc-header">Revisions</div>
            <div class="tc-body">

                <div class="revision-entry row pt-1 clickable"
                     (click)="selectRevision(revision)"
                     [class.active]="active === revision.number"
                     *ngFor="let revision of displayList">

                    <div class="revision-number h5">
                        {{ revision.number }}
                    </div>
                    <div class="revision-info">
                        <div class="revision-note" *ngIf="revision.note">
                            {{ revision.note }}
                        </div>
                        <div class="mb-1 revision-date form-control-label">
                            by {{ revision.author }} on {{ revision.date | date:'medium' }}
                        </div>
                    </div>
                </div>
            </div>
        </ct-editor-inspector-content>
    `
})
export class RevisionListComponent implements OnChanges {


    @Input()
    revisions: PlatformAppRevisionEntry[] = [];

    @Input()
    active: number;

    @Output()
    select = new Subject<number>();

    @Input()
    loadingRevision;

    displayList: {
        date: number,
        note: string,
        author: string,
        number: number
    }[] = [];

    selectRevision(revision) {
        if (revision.number === this.active) {
            return;
        }

        this.select.next(revision.number);

        this.loadingRevision = revision;
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.loadingRevision = undefined;

        if (!Array.isArray(changes["revisions"].currentValue)) {
            return;
        }

        this.displayList = changes["revisions"].currentValue.map(rev => ({
            date: rev["sbg:modifiedOn"] * 1000,
            note: rev["sbg:revisionNotes"],
            author: rev["sbg:modifiedBy"],
            number: rev["sbg:revision"]
        })).sort((a, b) => ~~b.number - ~~a.number);
    }
}
