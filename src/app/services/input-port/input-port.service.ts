import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";
import {CommandInputParameterModel as InputProperty} from "cwlts/models/d2sb";

interface PropertyOperation {
    (inputProperty: InputProperty[]): InputProperty[];
}

@Injectable()
export class InputPortService {

    /** The input ports stream we expose */
    public inputPorts: Observable<InputProperty[]>;

    /** Initial content of the input port list */
    private initialInputPorts: InputProperty[] = [];

    /** Stream for adding new input ports */
    private newInputPorts: Subject<InputProperty> = new Subject<InputProperty>();

    /** Stream for adding new input port */
    private deletedInputPort: Subject<number> = new Subject<number>();

    /** Stream that aggregates all changes on the exposedList list */
    private inputPortsUpdate: BehaviorSubject<PropertyOperation> = new BehaviorSubject<PropertyOperation>(undefined);

    constructor() {

        /* Subscribe the exposedList to inputPortsUpdate */
        this.inputPorts = this.inputPortsUpdate
            .filter(update => update !== undefined)
            .scan((inputPorts: InputProperty[], operation: PropertyOperation) => {
                return operation(inputPorts);
            }, this.initialInputPorts)
            .publishReplay(1)
            .refCount();

        /* Update the initialInputPorts when the inputPorts stream changes */
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
            .map((index: number): PropertyOperation => {
                return (inputPorts: InputProperty[]) => {
                    if (typeof inputPorts[index] !== 'undefined' && inputPorts[index] !== null) {
                        inputPorts.splice(index, 1);
                    }
                    return inputPorts;
                };
            })
            .subscribe(this.inputPortsUpdate);
    }

    public addInput(inputPort: InputProperty): void {
        this.newInputPorts.next(inputPort);
    }

    public deleteInputPort(index: number): void {
        this.deletedInputPort.next(index);
    }

    public setInputs(inputs: InputProperty[]): void {
        inputs.forEach(input => {
            this.newInputPorts.next(input);
        });
    }
}
