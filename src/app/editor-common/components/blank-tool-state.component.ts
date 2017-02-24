import {Component, ChangeDetectionStrategy, Input, Output, EventEmitter} from "@angular/core";
import {SystemService} from "../../platform-providers/system.service";

@Component({
    selector: "ct-blank-tool-state",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="container">
            <div class="row text-xs-center mb-1" *ngIf="title">
                <div class="offset-xs-1 col-xs-10 h5">
                    {{ title }}
                </div>
            </div>
            
            <div class="row text-xs-center mb-1" *ngIf="buttonText && !readonly">
                <div class="col-xs-12">
                    <button class="btn btn-primary" type="button" (click)="buttonClick.emit(true)">
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
    public readonly = false;

    @Input()
    public title = "";

    @Input()
    public buttonText;

    @Input()
    public learnMoreURL;

    @Output()
    public buttonClick = new EventEmitter<boolean>();

    constructor(private system: SystemService) {
    }
}
