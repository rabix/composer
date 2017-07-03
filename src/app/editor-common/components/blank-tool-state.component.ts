import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from "@angular/core";
import {SystemService} from "../../platform-providers/system.service";

@Component({
    selector: "ct-blank-tool-state",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div>
            <div class="row text-xs-center mb-1">
                <div class="offset-xs-1 col-xs-10">
                    <span *ngIf="title">{{ title }}</span>
                    <ng-content></ng-content>
                </div>
            </div>

            <div class="row text-xs-center mb-1" *ngIf="buttonText && !readonly">
                <div class="col-xs-12">
                    <button class="btn btn-secondary" type="button" (click)="buttonClick.emit(true)">
                        {{ buttonText }}
                    </button>
                </div>
            </div>

            <div class="row text-xs-center mb-1" *ngIf="learnMoreURL">
                <div class="col-xs-12">
                    or
                    <a href="" class="clickable nav-link"
                       (click)="$event.preventDefault(); system.openLink(learnMoreURL)">
                        Learn More
                    </a>
                </div>
            </div>
        </div>
    `
})
export class BlankToolStateComponent {

    @Input()
    readonly = false;

    @Input()
    title = "";

    @Input()
    buttonText;

    @Input()
    learnMoreURL;

    @Output()
    buttonClick = new EventEmitter<boolean>();

    constructor(public system: SystemService) {
    }
}
