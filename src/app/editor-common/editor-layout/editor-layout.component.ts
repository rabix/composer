import {Component, OnInit} from "@angular/core";

@Component({
    selector: "ct-editor-layout",
    template: `
        <ng-content></ng-content>
    `,
    styleUrls: ["./editor-layout.component.scss"],
})
export class EditorLayoutComponent implements OnInit {

    constructor() {
    }

    ngOnInit() {
    }

}
