import {Component, Input, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {ValidationResponse} from "../../services/webWorker/json-schema/json-schema.service";

@Component({
    selector: "validation-issues",
    template: `
            <div class="console-component" [ngClass]="{show: showConsole}">
                <div class="console-content">
                    <p class="errors">
                        {{ (issues | async)?.errorText }}
                    </p>
                </div>
            </div>  
            
            <button type="button" 
            class="btn btn-sm"
            (click)="toggleConsole()">
                <span *ngIf="(issues | async)?.errors?.length > 0">
                    <i class="fa fa-times-circle errors">
                    </i>
                    {{ (issues | async)?.errors?.length }}

                </span>
                <span *ngIf="(issues | async)?.warnings?.length > 0">
                    <i class="fa fa-warning warnings">
                    </i>
                    {{ (issues | async)?.warnings?.length }}
                </span>
            
                
                {{ buttonText }} 
                <i class="fa" 
                   [ngClass]="{'fa-angle-right': !showConsole, 'fa-angle-up': showConsole}">
                </i>
            </button>
`
})
export class ValidationIssuesComponent implements OnInit {
    @Input()
    public issues: Observable<ValidationResponse>;

    private buttonText = "Issues";
    private showConsole = false;

    private toggleConsole() {
        this.showConsole = !this.showConsole;
    }

    ngOnInit () {
        this.issues.subscribe(res => {
            const issues = res.errors.length + res.warnings.length;

            this.buttonText = issues > 0 ? (issues === 1 ? "Issue" : "Issues") : "No Issues";

        });

    }

}