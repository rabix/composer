import {Injectable} from "@angular/core";
import {InputProperty} from "../../models/input-property.model";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";

interface PropertyOperation extends Function {
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

    /** Stream that aggregates all changes on the inputPorts list */
    private inputPortsUpdate: Subject<any> = new Subject<any>();

    /** The currently  selected input port */
    public selectedInputPort: Observable<InputProperty>;

    /** Stream for updating the currently selected input port */
    private updateSelectedProperty: BehaviorSubject<InputProperty> = new BehaviorSubject<InputProperty>(undefined);

    constructor() {
        /* Subscribe the inputPorts to inputPortsUpdate */
        this.inputPorts = this.inputPortsUpdate
            .scan((inputPorts: InputProperty[], operation: PropertyOperation) => {
                return operation(inputPorts);
            }, this.initialInputPorts)
            .publishReplay(1)
            .refCount();

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
                    return inputPorts.filter((port) => port.id !== inputPortToDelete.id);
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
}
