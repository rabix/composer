import {Component, OnInit, Input} from '@angular/core';
import {CommandLineComponent} from "../../clt-editor/commandline/commandline.component";

@Component({
    selector: 'tool-footer',
    directives: [CommandLineComponent],
    template: `
        <commandline [content]="commandlineContent"></commandline>
`
})
export class ToolFooterComponent implements OnInit {
    @Input()
    commandLine: string;

    constructor() { }

    ngOnInit() { }

}