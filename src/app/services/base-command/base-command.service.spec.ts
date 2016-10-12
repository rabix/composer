import {inject} from "@angular/core/testing";
import {BaseCommandService, BaseCommand} from "./base-command.service";
import {TestBed} from "@angular/core/testing/test_bed";
import {ExpressionModel} from "cwlts/models/d2sb";

describe("BaseCommandService", () => {
    let baseCommandService: BaseCommandService;

    beforeEach(() => {

        TestBed.configureTestingModule({
            providers: [
                { provide: BaseCommandService, useClass: BaseCommandService }
            ]
        });
    });

    beforeEach(inject([BaseCommandService], (baseCommands: BaseCommandService) => {
        baseCommandService = baseCommands;
    }));

    describe("baseCommandsToFormList", () => {

        it("Should put subsequent string items as one list item", () => {
            const inputBaseCommand: Array<BaseCommand> = [
                "string 1",
                "string 2",
                "string 3"
            ];

            const result: Array<BaseCommand> = baseCommandService.baseCommandsToFormList(inputBaseCommand);
            expect(result).toEqual(["string 1 string 2 string 3"]);
        });

        it("Should put objects separately form subsequent strings", () => {

            const inputBaseCommand: Array<BaseCommand> = [
                new ExpressionModel({
                    script: "111",
                    expressionValue: "111"
                }),
                "string 1",
                "string 2",
                new ExpressionModel({
                    script: "222",
                    expressionValue: "222"
                }),
                "string 4",
                "string 5",
                new ExpressionModel({
                    script: "333",
                    expressionValue: "333"
                }),
                "string 7"
            ];

            const result: Array<BaseCommand> = baseCommandService.baseCommandsToFormList(inputBaseCommand);
            expect(result).toEqual([
                new ExpressionModel({ engine: 'cwl-js-engine', script: '111', expressionValue: '111' }),
                "string 1 string 2",
                new ExpressionModel({ engine: 'cwl-js-engine', script: '222', expressionValue: '222' }),
                "string 4 string 5",
                new ExpressionModel({ engine: 'cwl-js-engine', script: '333', expressionValue: '333' }),
                "string 7"
            ]);
        });
    });


    describe("addCommand", () => {
        it("Should add a new base command to the baseCommands stream", (done) => {
            baseCommandService.addCommand("echo");
            baseCommandService.addCommand("cat");
            baseCommandService.addCommand("grep");

            baseCommandService.baseCommands
                .subscribe((baseCommands: BaseCommand[]) => {
                    expect(baseCommands).toEqual([
                        "echo",
                        "cat",
                        "grep"
                    ]);
                    done();
                });
        });
    });


    describe("deleteBaseCommand", () => {
        it("Should remove the selected command from the baseCommands stream", (done) => {
            baseCommandService.addCommand("echo");
            baseCommandService.addCommand("cat");
            baseCommandService.addCommand("grep");

            baseCommandService.deleteBaseCommand(0);

            baseCommandService.baseCommands
                .subscribe((baseCommands: BaseCommand[]) => {
                    expect(baseCommands).toEqual([
                        "cat",
                        "grep"
                    ]);
                    done();
                });
        });
    });


    describe("updateSelectedCommand", () => {
        it("Should update the selectedBaseCommand stream with the new value", (done) => {

            baseCommandService.addCommand("echo");
            baseCommandService.addCommand("cat");
            baseCommandService.addCommand("cat");

            const newCommand = "echo 123";
            baseCommandService.updateCommand(0, newCommand);

            baseCommandService.baseCommands
                .subscribe((baseCommands: BaseCommand[]) => {
                    expect(baseCommands).toEqual([
                        newCommand,
                        "cat",
                        "cat"
                    ]);
                    done();
                });
        });
    });


    describe("setBaseCommands", () => {
        it("Should set the baseCommands to the given list", (done) => {

            baseCommandService.setBaseCommands(["echo", "grep", "cat"]);

            baseCommandService.baseCommands
                .subscribe((baseCommands: BaseCommand[]) => {
                    expect(baseCommands).toEqual(["echo", "grep", "cat"]);
                    done();
                });
        });
    });

    describe("formListToBaseCommandArray", () => {
        it("Should change the form list to the cwl model format", () => {

            const formList: BaseCommand[] = [
                new ExpressionModel({ engine: 'cwl-js-engine', script: '111', expressionValue: '111' }),
                "string1 string2",
                new ExpressionModel({ engine: 'cwl-js-engine', script: '222', expressionValue: '222' }),
                "string4 string5",
                new ExpressionModel({ engine: 'cwl-js-engine', script: '333', expressionValue: '333' }),
                "string7",
                "'string with quotes'",
                "\"string with quotes 2\""
            ];

            const expectedCommandArray: BaseCommand[] = [
                new ExpressionModel({
                    script: "111",
                    expressionValue: "111"
                }),
                "string1",
                "string2",
                new ExpressionModel({
                    script: "222",
                    expressionValue: "222"
                }),
                "string4",
                "string5",
                new ExpressionModel({
                    script: "333",
                    expressionValue: "333"
                }),
                "string7",
                "'string with quotes'",
                "\"string with quotes 2\""
            ];

            let result = baseCommandService.formListToBaseCommandArray(formList);

            expect(result).toEqual(expectedCommandArray);
        });
    });

});

