import {Component, Input, OnInit, OnDestroy} from "@angular/core";
import {Observable, Subscription} from "rxjs";
import {ValidationResponse} from "../../services/web-worker/json-schema/json-schema.service";

@Component({
    selector: "validation-issues",
    template: `
            <div class="console-component" [ngClass]="{show: showConsole}">
                <div class="console-content">
                    <p class="errors">
                        {{ issues?.errorText }}
                    </p>
                </div>
            </div>  
            
            <button type="button" 
            class="btn btn-sm"
            (click)="toggleConsole()">
                <span *ngIf="issues?.errors?.length > 0">
                    <i class="fa fa-times-circle errors">
                    </i>
                    {{ issues?.errors?.length }}

                </span>
                <span *ngIf="issues?.warnings?.length > 0">
                    <i class="fa fa-warning warnings">
                    </i>
                    {{ issues?.warnings?.length }}
                </span>
            
                
                {{ buttonText }} 
                <i class="fa icon-angle" 
                   [ngClass]="{'fa-angle-right': !showConsole, 'fa-angle-up': showConsole}">
                </i>
            </button>
`
})
export class ValidationIssuesComponent implements OnInit, OnDestroy {
    @Input()
    public issuesStream: Observable<ValidationResponse>;

    private issues      = ValidationResponse;
    private buttonText  = "Issues";
    private showConsole = false;

    private subs: Subscription[] = [];

    private toggleConsole() {
        this.showConsole = !this.showConsole;
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