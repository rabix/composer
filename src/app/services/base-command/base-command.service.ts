import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {ExpressionModel} from "cwlts/models/d2sb";
import {Expression} from "cwlts/mappings/d2sb/Expression";

export type BaseCommand = string | Expression;

type UpdateBaseCommand = {
    index: number,
    newBaseCommand: ExpressionModel
}

interface BaseCommandOperation {
    (baseCommands: ExpressionModel[]): ExpressionModel[];
}

@Injectable()
export class BaseCommandService {

    /** The input ports stream we expose */
    public baseCommands: Observable<ExpressionModel[]>;

    /** Initial content of the input port list */
    private initialBaseCommands: ExpressionModel[] = [];

    /** Stream for adding new imports */
    private newBaseCommand: Subject<ExpressionModel> = new Subject<ExpressionModel>();

    /** Stream for adding new imports */
    private deletedBaseCommand: Subject<number> = new Subject<number>();

    private updatedBaseCommand: Subject<UpdateBaseCommand> = new Subject<UpdateBaseCommand>();

    /** Stream that aggregates all changes on the exposedList list */
    private baseCommandsUpdate: Subject<BaseCommandOperation> = new Subject<BaseCommandOperation>();

    constructor() {
        /* Subscribe the exposedList to baseCommandsUpdate */
        this.baseCommands = this.baseCommandsUpdate
            .filter(update => update !== undefined)
            .scan((baseCommands: Array<ExpressionModel>, operation: BaseCommandOperation) => {
                return operation(baseCommands);
            }, this.initialBaseCommands)
            .publishReplay(1)
            .refCount();

        /* Update the initialBaseCommands when the baseCommands stream changes */
        this.baseCommands.subscribe((commandList: ExpressionModel[]) => {
            this.initialBaseCommands = commandList;
        });

        /* Add new base command */
        this.newBaseCommand
            .map((baseCommand: ExpressionModel): BaseCommandOperation => {
                return (baseCommands: ExpressionModel[]) => {
                    return baseCommands.concat(baseCommand);
                };
            })
            .subscribe(this.baseCommandsUpdate);

        /* Delete input ports */
        this.deletedBaseCommand
            .map((index: number): BaseCommandOperation => {
                return (baseCommands: ExpressionModel[]) => {
                    if (typeof baseCommands[index] !== 'undefined' && baseCommands[index] !== null) {
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
                newBaseCommand: newBaseCommand
            }): BaseCommandOperation => {

                return (baseCommands: ExpressionModel[]) => {
                    if (typeof baseCommands[index] !== 'undefined' && baseCommands[index] !== null) {
                        baseCommands[index] = newBaseCommand;
                    }

                    return baseCommands;
                };
            })
            .subscribe(this.baseCommandsUpdate);
    }

    public addCommand(baseCommand: ExpressionModel): void {
        this.newBaseCommand.next(baseCommand);
    }

    public deleteBaseCommand(index: number): void {
        this.deletedBaseCommand.next(index);
    }

    public updateCommand(index: number, newBaseCommand: ExpressionModel): void {
        this.updatedBaseCommand.next(<UpdateBaseCommand>{
            index: index,
            newBaseCommand: newBaseCommand
        });
    }

    public setBaseCommands(baseCommands: ExpressionModel[]): void {
        baseCommands.forEach(command => {
            this.newBaseCommand.next(command);
        });
    }

    public baseCommandsToFormList(toolBaseCommand: BaseCommand[]): ExpressionModel[] {
        const commandInputList: ExpressionModel[] = [];
        let newCommandInput = "";

        if (!toolBaseCommand) {
            return commandInputList;
        }

        toolBaseCommand.forEach((command: BaseCommand, index: number) => {
            //If it's a string
            if (typeof command === "string") {
                let commandToAdd: string;

                if (index < toolBaseCommand.length - 1) {
                    commandToAdd = command + " ";
                } else {
                    commandToAdd = command;
                }

                newCommandInput = newCommandInput.concat(commandToAdd);

                if (index === toolBaseCommand.length - 1) {
                    commandInputList.push(new ExpressionModel({
                        value: newCommandInput,
                        evaluatedValue: newCommandInput,
                    }));
                }

            } else {
                if (newCommandInput !== "") {
                    const newValue = newCommandInput.slice(0, -1);
                    commandInputList.push(new ExpressionModel({
                        value: newValue,
                        evaluatedValue: newValue,
                    }));
                }

                commandInputList.push(new ExpressionModel({
                    value: command,
                    evaluatedValue: newCommandInput,
                }));

                newCommandInput = "";
            }
        });

        return commandInputList;
    }

    public formListToBaseCommandArray(formCommandList: ExpressionModel[]): BaseCommand[] {
        let commandList: BaseCommand[] = [];

        if (!formCommandList) {
            return commandList;
        }

        formCommandList.forEach((command) => {
            const cwlCommand = command.serialize();

            //If it's a string
            if (typeof cwlCommand === "string") {

                if (this.hasQuotes(cwlCommand)) {
                    commandList.push(cwlCommand);
                } else {
                    //Replace subsequent whitespaces with single white space and trim
                    const trimmedCommand = cwlCommand.replace(/ +(?= )/g,'').trim();

                    //Split on spaces
                    const stringArray = trimmedCommand.split(" ");
                    commandList = commandList.concat(stringArray);
                }
            } else {
                commandList.push(cwlCommand);
            }
        });

        return commandList;
    }

    public hasQuotes(text: string) {
        if (text.charAt(0) === "'" && text.charAt(text.length - 1) >= "'" ) {
            return true;
        }

        return text.charAt(0) === '"' && text.charAt(text.length - 1) >= '"';
    }
}
