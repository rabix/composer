import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Subject} from "rxjs/Subject";
import {ExpressionModel} from "cwlts/lib/models/d2sb";

export type BaseCommand = string | ExpressionModel;

interface BaseCommandOperation {
    (baseCommands: BaseCommand[]): BaseCommand[];
}

@Injectable()
export class BaseCommandService {

    /** The input ports stream we expose */
    public baseCommands: Observable<BaseCommand[]>;

    /** Initial content of the input port list */
    private initialBaseCommands: BaseCommand[] = [];

    /** Stream for adding new imports */
    private newBaseCommand: Subject<BaseCommand> = new Subject<BaseCommand>();

    /** Stream for adding new imports */
    private deletedBaseCommand: Subject<BaseCommand> = new Subject<BaseCommand>();

    private updatedBaseCommand: Subject<any> = new Subject<any>();

    /** Stream that aggregates all changes on the exposedList list */
    private baseCommandsUpdate: BehaviorSubject<BaseCommandOperation> = new BehaviorSubject<BaseCommandOperation>(undefined);

    /** The currently  selected input port */
    public selectedBaseCommand: Observable<BaseCommand>;
    public lastSelectedBaseCommand: BaseCommand;

    /** Stream for changing the currently selected input port */
    private changeSelectedCommand: BehaviorSubject<BaseCommand> = new BehaviorSubject<BaseCommand>(undefined);

    constructor() {
        /* Subscribe the exposedList to baseCommandsUpdate */
        this.baseCommands = this.baseCommandsUpdate
            .filter(update => update !== undefined)
            .scan((baseCommands: Array<BaseCommand>, operation: BaseCommandOperation) => {
                return operation(baseCommands);
            }, this.initialBaseCommands)
            .publishReplay(1)
            .refCount();

        /* Update the initialBaseCommands when the baseCommands stream changes */
        this.baseCommands.subscribe((commandList: Array<BaseCommand>) => {
            this.initialBaseCommands = commandList;
        });

        /* Add new base command */
        this.newBaseCommand
            .map((baseCommand: BaseCommand): BaseCommandOperation => {
                return (baseCommands: BaseCommand[]) => {
                    return baseCommands.concat(baseCommand);
                };
            })
            .subscribe(this.baseCommandsUpdate);

        /* Delete input ports */
        this.deletedBaseCommand
            .map((baseCommandToDelete: BaseCommand): BaseCommandOperation => {
                return (baseCommands: BaseCommand[]) => {
                    const index = baseCommands.indexOf(baseCommandToDelete);

                    if (index !== -1) {
                        baseCommands.splice(index, 1);
                    }

                    return baseCommands;
                };
            })
            .subscribe(this.baseCommandsUpdate);

        /* Update input ports */
        this.updatedBaseCommand
            .map(({
                index: index,
                newCommand: newBaseCommand
            }): BaseCommandOperation => {

                return (baseCommands: BaseCommand[]) => {
                    if (typeof baseCommands[index] !== 'undefined' && baseCommands[index] !== null) {
                        baseCommands[index] = newBaseCommand;
                    }

                    return baseCommands;
                };
            })
            .subscribe(this.baseCommandsUpdate);

        /* Set selected input port */
        this.selectedBaseCommand = this.changeSelectedCommand.map(baseCommand => {
            this.lastSelectedBaseCommand = baseCommand;
            return baseCommand
        });
    }

    public addCommand(baseCommand: BaseCommand): void {
        this.newBaseCommand.next(baseCommand);
    }

    public deleteBaseCommand(baseCommand: BaseCommand): void {
        this.deletedBaseCommand.next(baseCommand);
    }

    public setSelectedCommand(baseCommand: BaseCommand): void {
        this.changeSelectedCommand.next(baseCommand);
    }

    public updateCommand(index: number, newBaseCommand: BaseCommand): void {
        this.updatedBaseCommand.next({
            index: index,
            newCommand: newBaseCommand
        });
    }

    public setBaseCommands(baseCommands: BaseCommand[]): void {
        baseCommands.forEach(command => {
            this.newBaseCommand.next(command);
        });
    }

    //TODO (mate): make this simpler, too hard to read
    public baseCommandToInputArray(toolBaseCommand: Array<BaseCommand>): BaseCommand[] {
        const commandInputList: BaseCommand[] = [];

        if (!toolBaseCommand) {
            return commandInputList;
        }

        let lastItemType = "string" | "object";
        let newCommandInput: string = "";

        toolBaseCommand.forEach((command, index) => {
            //If it's a string
            if (typeof command === "string") {
                lastItemType = "string";

                if (lastItemType === "string") {
                    let commandToAdd: string;

                    if (index < toolBaseCommand.length - 1) {
                        commandToAdd = command + " ";
                    } else {
                        commandToAdd = command;
                    }

                    newCommandInput = newCommandInput.concat(commandToAdd);

                } else {
                    newCommandInput = command;
                }

                if (index === toolBaseCommand.length - 1) {
                    commandInputList.push(newCommandInput);
                }

            } else {
                lastItemType = "object";

                if (newCommandInput !== "") {
                    commandInputList.push(newCommandInput.slice(0, -1));
                }

                commandInputList.push(command);
                newCommandInput = "";
            }
        });

        return commandInputList;
    }
}
