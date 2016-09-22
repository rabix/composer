import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";
import {CommandInputParameterModel as InputProperty} from "cwlts/lib/models/d2sb";

interface PropertyOperation {
    (inputProperty: InputProperty[]): InputProperty[];
}

@Injectable()
export class InputPortService {

    /** The input ports stream we expose */
    public inputPorts: Observable<InputProperty[]>;

    /** Initial content of the input port list */
    private initialInputPorts: InputProperty[] = [];

    /** Stream for adding new imports */
    private newInputPorts: Subject<InputProperty> = new Subject<InputProperty>();

    /** Stream for adding new imports */
    private deletedInputPort: Subject<InputProperty> = new Subject<InputProperty>();

    /** Stream that aggregates all changes on the exposedList list */
    private inputPortsUpdate: BehaviorSubject<PropertyOperation> = new BehaviorSubject<PropertyOperation>(undefined);

    /** The currently  selected input port */
    public selectedInputPort: Observable<InputProperty>;

    /** Stream for updating the currently selected input port */
    private updateSelectedProperty: BehaviorSubject<InputProperty> = new BehaviorSubject<InputProperty>(undefined);

    constructor() {
        /* Subscribe the exposedList to inputPortsUpdate */
        this.inputPorts = this.inputPortsUpdate
            .filter(update => update !== undefined)
            .scan((inputPorts: InputProperty[], operation: PropertyOperation) => {
                return operation(inputPorts);
            }, this.initialInputPorts)
            .publishReplay(1)
            .refCount();
        
        /* Update the initialInputPorts when the inputPorts steam changes */
        this.inputPorts.subscribe((portList: InputProperty[]) => {
            this.initialInputPorts = portList;
        });
        
        /* Add new input ports */
        this.newInputPorts
            .map((inputPort: InputProperty): PropertyOperation => {
                return (inputPorts: InputProperty[]) => {
                    return inputPorts.concat(inputPort);
                };
            })
            .subscribe(this.inputPortsUpdate);

        /* Delete input ports */
        this.deletedInputPort
            .map((inputPortToDelete: InputProperty): PropertyOperation => {
                return (inputPorts: InputProperty[]) => {
                    const index = inputPorts.indexOf(inputPortToDelete);
                    
                    if(index !== -1) {
                        inputPorts.splice(index, 1);
                    }

                    return inputPorts;
                };
            })
            .subscribe(this.inputPortsUpdate);

        /* Set selected input port */
        this.selectedInputPort = this.updateSelectedProperty.map(inputPort => inputPort);
    }

    public addInput(inputPort: InputProperty): void {
        this.newInputPorts.next(inputPort);
    }

    public deleteInputPort(inputPort: InputProperty): void {
        this.deletedInputPort.next(inputPort);
    }

    public setSelected(inputPort: InputProperty): void {
        this.updateSelectedProperty.next(inputPort);
    }

    setInputs(inputs: Array<InputProperty>): void {
        inputs.forEach(input => {
            this.newInputPorts.next(input);
        })
    }
}
