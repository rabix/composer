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
                    {{inputPortVm.inputProperty.id}}
                </div>
            </div>

            <div class="col-sm-2" title="{{inputPort.type}}">
                {{inputPortVm.inputProperty.type}}
            </div>
            
            <div class="col-sm-2" title="{{inputPort.value}}">
               {{inputPortVm.value}}
            </div>

            <div class="col-sm-1 pull-right tool-input-icon">
                <i class="fa fa-trash"
                   aria-hidden="true"
                   (click)="removeProperty($event, i)"></i>
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

    @Input()
    private selectedIndex: number;

    //TODO
    //private portList: Array<InputProperty> = [];

    private viewModelPortList: Array<InputPropertyViewModel> = [];

    private subs: Subscription[];

    constructor(private inputPortService: InputPortService,
                private inputSidebarService: InputSidebarService) {
        this.subs = [];

        this.inputPortService.inputPorts.subscribe((viewModelPortList: InputPropertyViewModel[]) => {
            this.viewModelPortList = viewModelPortList;
        });
    }

    private trackByIndex(index: number): any {
        return index;
    }

    private editProperty(index: number): void {
        this.selectedIndex = index;
        const selectedInputPort = this.viewModelPortList[index];
        this.inputSidebarService.openInputInspector(selectedInputPort);
    }

    private removeProperty(event: Event, index: number): void {
        event.stopPropagation();
        this.inputPortService.deleteInputPort(index);

        if (this.selectedIndex === index) {
            this.inputSidebarService.closeInputInspector();
        }

        if (this.selectedIndex > index) {
            this.selectedIndex--;
        } else if (this.selectedIndex === index) {
            this.selectedIndex = undefined;
        }
    }

    ngOnDestroy(): void {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
