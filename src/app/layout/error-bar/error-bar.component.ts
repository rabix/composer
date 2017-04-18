import {Component, Input} from "@angular/core";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {ErrorBarService} from "./error-bar.service";

@Component({
    selector: "ct-error-bar",
    styleUrls: ["./error-bar.component.scss"],
    template: `
        <div class="error-alert pl-1" [class.show]="show">
            <i class="fa fa-minus-circle"></i>

            <div class="error-text pr-1">
                {{error}}
            </div>

            <i class="fa fa-times clickable" (click)="close()"></i>
        </div>
    `
})
export class ErrorBarComponent extends DirectiveBase {

    @Input()
    public autoClose = false;

    @Input()
    public fadeOutTime = 3000;

    public show = false;

    public error: string;

    constructor(public errorBarService: ErrorBarService) {
        super();
        this.tracked = this.errorBarService.message.do((message) => {
            this.error = message;
            this.open();
        }).debounceTime(this.fadeOutTime).subscribe(() => {
            if (this.autoClose) {
                this.close();
            }
        });
    }

    public open() {
        this.show = true;
    }

    public close() {
        this.show = false;
    }
}
