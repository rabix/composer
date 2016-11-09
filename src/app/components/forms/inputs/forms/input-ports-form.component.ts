import {Component, Input, OnInit} from "@angular/core";
import {InputPortListComponent} from "../types/input-port-list.component";
import {InputPortService} from "../../../../services/input-port/input-port.service";
import {CommandLineToolModel} from "cwlts/models/d2sb";
import {FormSectionComponent} from "../../../form-section/form-section.component";
import {InputSidebarService} from "../../../../services/sidebars/input-sidebar.service";
import {Subscription} from "rxjs/Subscription";
import {CommandInputParameterModel as InputProperty} from "cwlts/models/d2sb";

require("./input-ports-form.component.scss");

@Component({
    selector: 'inputs-ports-form',
    providers: [InputPortService],
    directives: [InputPortListComponent, FormSectionComponent],
    template: `
<ct-form-section>
    <div class="tc-header">Input Ports</div>
    <div class="tc-body">
        <form>
            <input-port-list [context]="context" 
                            [selectedIndex]="selectedIndex"></input-port-list>

            <button type="button" 
                    class="btn btn-link add-btn-link"
                    (click)="addInput()">
                    <i class="fa fa-plus"></i> Add Input
            </button>
        </form>
    </div>
</ct-form-section>
        
    `
})
export class InputPortsFormComponent implements OnInit {
    @Input()
    public cltModel: CommandLineToolModel;

    public context: any;

    private portList: InputProperty[] = [];

    private subs: Subscription[] = [];

    private selectedIndex: number;

    constructor(private inputPortService: InputPortService,
                private inputSidebarService: InputSidebarService) {

        this.subs.push(
            this.inputPortService.inputPorts.subscribe((portList: InputProperty[]) => {
                this.portList = portList;
            })
        );
    }

    ngOnInit() {
        this.inputPortService.setInputs(this.cltModel.inputs);
        this.context = {$job: this.cltModel.job}
    }

    private addInput(): void {
        this.selectedIndex = this.portList.length;
        const newInput: InputProperty = this.cltModel.addInput();

        this.inputPortService.addInput(newInput);
        this.inputSidebarService.openInputInspector({
            inputProperty: newInput,
            context: this.context
        });
    }

    ngOnDestroy(): void {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
