import {Component, OnInit, ChangeDetectionStrategy} from "@angular/core";

@Component({
    selector: "ct-circular-loader",
    template: `<div class="loader-container"><div class="loader"></div></div>`,
    styleUrls: ["./circular-loader.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CircularLoaderComponent implements OnInit {

    constructor() {
    }

    ngOnInit() {
    }

}
