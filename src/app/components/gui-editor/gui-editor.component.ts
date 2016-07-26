import {Component, OnInit, Input} from "@angular/core";
import {NgFor} from "@angular/common";
import {FileRegistry} from "../../services/file-registry.service";
import {FileModel} from "../../store/models/fs.models";
import {PropertyInput} from "../forms/inputs/property-input.component";

require('./gui-editor.component.scss');

@Component({
    selector: 'gui-editor',
    directives: [NgFor, PropertyInput],
    template: `
                <div id="guiEditorContainer">
                    <property-input *ngFor="let property of mockInputProperties"
                         class="propertyInput" 
                         [type]="property.type" 
                         [model]="property.value">
                    </property-input>
                </div>`,
})
export class GuiEditorComponent implements OnInit {
    @Input() file: FileModel;

    /* TODO: get tool properties for display, create a service that returns a list of properties based on the tool */
    /*mockInputProperties: Array<any> = [
        {
            type: "DockerRequirement",
            value: {
                dockerPull: "some.docker.image.com"
            }
        },
        {
            type: "baseCommand",
            value: "echo"
        }
    ];*/
    mockInputProperties: Array<any> = [
        {
            type: "DockerRequirement",
            value: null
        },
        {
            type: "baseCommand",
            value: null
        }
    ];

    constructor(private fileRegistry: FileRegistry) {}

    ngOnInit(): void {

    }

}
