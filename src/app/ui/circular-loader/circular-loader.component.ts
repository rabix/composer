import {Component, OnInit, ChangeDetectionStrategy} from "@angular/core";

@Component({
    selector: "ct-circular-loader",
    template: `
        <div class="profile-main-loader">
            <div class="loader">
                <svg class="circular-loader" viewBox="25 25 50 50">
                    <circle class="loader-path" cx="50" cy="50" r="20" fill="none" stroke-width="1"/>
                </svg>
            </div>
        </div>
    `,
    styleUrls: ["./circular-loader.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CircularLoaderComponent implements OnInit {

    constructor() {
    }

    ngOnInit() {
    }

}
