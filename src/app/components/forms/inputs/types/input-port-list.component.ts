import {Component, OnDestroy} from "@angular/core";
import {InputPortService} from "../../../../services/input-port/input-port.service";
import {CommandInputParameterModel as InputProperty} from "cwlts/models/d2sb";
import {Subscription} from "rxjs/Subscription";
import {InputSidebarService} from "../../../../services/sidebars/input-sidebar.service";

@Component({
    selector: "input-port-list",
    template: `<div *ngIf="portList.length > 0">

    <div class="gui-section-list-title">
        <div class="col-sm-7">
            ID
        </div>
        <div class="col-sm-2">
            Type
        </div>
        <div class="col-sm-3">
            Value
        </div>
    </div>

    <ul class="gui-section-list">

        <li class="gui-section-list-item clickable"
            *ngFor="let inputPort of portList"
            (click)="editProperty(inputPort)">

            <div class="col-sm-7" title="{{inputPort.id}}">
                <div class="ellipsis">
                    {{inputPort.id}}
                </div>
            </div>

            <div class="col-sm-2" title="{{inputPort.type}}">
                {{inputPort.type}}
            </div>
            
            <div class="col-sm-2" title="{{inputPort.value}}">
                {{inputPort.value}}
            </div>

            <div class="col-sm-1 pull-right tool-input-icon">
                <i class="fa fa-trash"
                   aria-hidden="true"
                   (click)="removeProperty(inputPort)"></i>
            </div>
        </li>
    </ul>
</div> <!-- List end -->

<div *ngIf="portList.length === 0" class="col-sm-12">
    No input ports defined.
</div>
    `
})
export class InputPortListComponent implements OnDestroy {

    private portList: Array<InputProperty> = [];

    private selectedInputPort: InputProperty;

    private subs: Subscription[];

    constructor(private inputPortService: InputPortService,
                private inputSidebarService: InputSidebarService) {

        this.subs = [];

        let updatePortList = this.inputPortService.inputPorts.subscribe((portList: InputProperty[]) => {
            this.portList = portList;
        });

        let updateSelectedInputPort = this.inputPortService.selectedInputPort.subscribe(inputPort => {
            this.selectedInputPort = inputPort;
        });

        this.subs.push(updatePortList);
        this.subs.push(updateSelectedInputPort);
    }

    private editProperty(inputPort: InputProperty): void {
        this.inputPortService.setSelected(inputPort);
        this.inputSidebarService.openInputInspector(inputPort);
    }

    private removeProperty(inputPort: InputProperty): void {
        this.inputPortService.deleteInputPort(inputPort);

        if (this.selectedInputPort === inputPort) {
            this.inputSidebarService.closeInputInspector();
        }
    }

    ngOnDestroy(): void {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
