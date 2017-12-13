import {ChangeDetectionStrategy, Component, ContentChild, EventEmitter, Input, Output} from "@angular/core";
import {SystemService} from "../../platform-providers/system.service";

@Component({
    selector: "ct-blank-state",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div>
            <div class="row text-xs-center mb-1">
                <div class="offset-xs-1 col-xs-10">
                    <span *ngIf="title">{{ title }}</span>
                    {{description}}
                    <ng-content select="[tc-description]"></ng-content>
                    
                </div>
            </div>

            <div class="row text-xs-center mb-1" *ngIf="hasAction && !readonly">
                <div class="col-xs-12">

                    <div #contentWrapper>
                        <ng-content select="[tc-content]"></ng-content>
                    </div>

                    <button *ngIf="contentWrapper.children.length == 0"
                            class="btn btn-primary" 
                            type="button" 
                            (click)="buttonClick.emit(true)"
                            data-test="blank-state-add-button">
                        {{ buttonText }}
                        <ng-content select="[tc-button-text]"></ng-content>
                    </button>

                </div>
            </div>

            <div class="row text-xs-center mb-1" *ngIf="learnMoreURL">
                <div class="col-xs-12">
                    or
                    <a #link [href]="learnMoreURL" class="clickable nav-link"
                       (click)="$event.preventDefault(); system.openLink(link.href)">
                        Learn More
                    </a>
                </div>
            </div>
        </div>
    `
})
export class BlankStateComponent {

    @Input()
    readonly = false;

    @Input()
    hasAction = false;

    @Input()
    title = "";

    @Input()
    description = "";

    @Input()
    buttonText;

    @Input()
    learnMoreURL;

    @Output()
    buttonClick = new EventEmitter<boolean>();




    constructor(public system: SystemService) {
    }
}
