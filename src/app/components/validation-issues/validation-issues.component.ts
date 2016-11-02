import {Component, Input, OnInit, OnDestroy, Output} from "@angular/core";
import {Observable, Subscription, ReplaySubject} from "rxjs";
import {ValidationResponse} from "../../services/web-worker/json-schema/json-schema.service";

@Component({
    selector: "validation-issues",
    template: `
            <div class="console-component" [ngClass]="{show: show}">
                <div class="console-content">
                    <p class="error-text">
                        {{ issues?.errorText }}
                    </p>
                </div>
            </div>  
            
            <button type="button" 
            class="btn btn-sm"
            (click)="toggleConsole()">
                <span *ngIf="issues?.errors?.length > 0">
                    <i class="fa fa-times-circle error">
                    </i>
                    {{ issues?.errors?.length }}

                </span>
                <span *ngIf="issues?.warnings?.length > 0">
                    <i class="fa fa-warning warning">
                    </i>
                    {{ issues?.warnings?.length }}
                </span>
            
                
                {{ buttonText }} 
                <i class="fa icon-angle" 
                   [ngClass]="{'fa-angle-right': !show, 'fa-angle-up': show}">
                </i>
            </button>
`
})
export class ValidationIssuesComponent implements OnInit, OnDestroy {
    @Input()
    public issuesStream: Observable<ValidationResponse>;

    @Input()
    public show: boolean;

    @Output()
    public select = new ReplaySubject<"validation">();

    private issues      = ValidationResponse;
    private buttonText  = "No Issues";

    private subs: Subscription[] = [];

    private toggleConsole() {
        this.select.next("validation");
    }

    ngOnInit() {
        this.subs.push(this.issuesStream.subscribe(res => {
            this.issues  = res;
            const number = res.errors.length + res.warnings.length;

            this.buttonText = number > 0 ? (number === 1 ? "Issue" : "Issues") : "No Issues";

        }));
    }

    ngOnDestroy() {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}