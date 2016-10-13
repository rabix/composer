import {Component, Input, OnInit} from "@angular/core";
import {InputPortListComponent} from "../types/input-port-list.component";
import {InputPortService} from "../../../../services/input-port/input-port.service";
import {CommandLineToolModel, CommandInputParameterModel as InputProperty} from "cwlts/models/d2sb";
import {InputSidebarService} from "../../../../services/sidebars/input-sidebar.service";
import {Subscription} from "rxjs/Subscription";

require("./input-ports-form.component.scss");
require("./shared/form.components.scss");

@Component({
    selector: 'inputs-ports-form',
    providers: [InputPortService],
    directives: [InputPortListComponent],
    template: `
        <form>
            <fieldset class="form-group">
                <label>Input ports</label>
                
                <button type="button" class="btn btn-link hide-btn">Hide</button>
    
                <input-port-list [selectedIndex]="selectedIndex"></input-port-list>
            </fieldset>
            
            <button type="button" class="btn btn-secondary add-input-btn" 
                    (click)="addInput()">Add Input</button>
        </form>
    `
})
export class InputPortsFormComponent implements OnInit {
    @Input()
    public cltModel: CommandLineToolModel;

    private portList: Array<InputProperty> = [];

    private subs: Subscription[];

    private selectedIndex: number;

    constructor(private inputPortService: InputPortService,
                private inputSidebarService: InputSidebarService) {

        this.subs = [];
        this.subs.push(
            this.inputPortService.inputPorts.subscribe((portList: InputProperty[]) => {
                this.portList = portList;
            })
        );
    }

    private addInput(): void {
        this.selectedIndex = this.portList.length;
        const newInput = this.cltModel.addInput();

        this.inputPortService.addInput(newInput);
        this.inputSidebarService.openInputInspector(newInput);
    }

    ngOnInit() {
        this.inputPortService.setInputs(this.cltModel.inputs);
    }
}
