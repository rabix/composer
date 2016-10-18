import {Component, OnDestroy, Input} from "@angular/core";
import {InputPortService, InputPropertyViewModel} from "../../../../services/input-port/input-port.service";
import {Subscription} from "rxjs/Subscription";
import {InputSidebarService} from "../../../../services/sidebars/input-sidebar.service";

@Component({
    selector: "input-port-list",
    template: `
            <div *ngIf="viewModelPortList.length > 0">
            
                <div class="row">
                    <div class="col-sm-4">
                        Value
                    </div>
                    <div class="col-sm-3">
                        ID               
                    </div>
                    <div class="col-sm-1">
                        Type
                    </div>
                </div>

                 <div class="tool-input-row" 
                      *ngFor="let inputPortVm of viewModelPortList; let i = index; trackBy:trackByIndex"  
                      (click)="editProperty(i)">  
                 
                    <div class="col-sm-4">
                        {{inputPortVm.value}}
                    </div>
                      
                    <div class="col-sm-3">
                        {{inputPortVm.inputProperty.id}}         
                    </div>
                    
                    <div class="col-sm-1">
                        {{inputPortVm.inputProperty.type}}      
                    </div>
                    
                    <div class="col-sm-1 pull-right tool-input-icon">
                        <i class="fa fa-trash" 
                           aria-hidden="true"
                           (click)="removeProperty($event, i)"></i>
                    </div>
                </div>
        </div> <!-- List end -->
        
        <div *ngIf="viewModelPortList.length === 0" class="col-sm-12">
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

    private removeProperty(event: Event, index: number) {
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
