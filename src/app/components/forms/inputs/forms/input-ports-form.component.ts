import {Component, Input, OnInit} from "@angular/core";
import {InputPortListComponent} from "../types/input-port-list.component";
import {InputPortService, InputPropertyViewModel} from "../../../../services/input-port/input-port.service";
import {CommandLineToolModel} from "cwlts/models/d2sb";
import {InputSidebarService} from "../../../../services/sidebars/input-sidebar.service";
import {Subscription} from "rxjs/Subscription";
import {SandboxService} from "../../../../services/sandbox/sandbox.service";

require("./input-ports-form.component.scss");
require("./shared/form.components.scss");

@Component({
    selector: 'inputs-ports-form',
    providers: [InputPortService, SandboxService],
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

    private portList: InputPropertyViewModel[] = [];

    private subs: Subscription[];

    private selectedIndex: number;

    constructor(private inputPortService: InputPortService,
                private inputSidebarService: InputSidebarService) {

        this.subs = [];
        this.subs.push(
            this.inputPortService.inputPorts.subscribe((portList: InputPropertyViewModel[]) => {
                this.portList = portList;
            })
        );
    }

    private addInput(): void {
        this.selectedIndex = this.portList.length;
        const newInput = this.cltModel.addInput();

        const newViewModel = {
            value: "",
            inputProperty: newInput
        };

        this.inputPortService.addInput(newViewModel);
        this.inputSidebarService.openInputInspector(newViewModel);
    }

    ngOnInit() {
        this.subs.push(
            this.inputPortService.inputPortListToViewModelList(this.cltModel.inputs)
                .subscribe((viewModelPortList: InputPropertyViewModel[]) => {
                    this.inputPortService.setInputs(viewModelPortList)
                })
        );
    }
}
