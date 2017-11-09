import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";

@Component({
    selector: "ct-input-job-inspector",
    template: `
        <button class="btn btn-primary" type="button">
            Add a File
        </button>
    `,
    styleUrls: ["./input-job-inspector.component.scss"],
})
export class InputJobInspectorComponent implements OnInit {


    @Input()
    value: any;


    @Output()
    valueChange = new EventEmitter<any>();

    constructor() {
    }

    ngOnInit() {
    }

}
