import {inject} from "@angular/core/testing";
import {BaseCommandService, BaseCommand} from "./base-command.service";
import {TestBed} from "@angular/core/testing/test_bed";

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
            const inputBaseCommand: Array<string> = [
                "string 1",
                "string 2",
                "string 3"
            ];

            const result: Array<string | Object> = baseCommandService.baseCommandsToFormList(inputBaseCommand);
            expect(result).toEqual(["string 1 string 2 string 3"]);
        });

        it("Should put objects separately form subsequent strings", () => {
            const inputBaseCommand: Array<string | Object> = [
                { class: "Expression", engine: "cwl-js-engine", script: "string"},
                "string 1",
                "string 2",
                { class: "Expression", engine: "cwl-js-engine", script: "string 3"},
                "string 4",
                "string 5",
                { class: "Expression", engine: "cwl-js-engine", script: "string 6"},
                "string 7"
            ];

            const result: Array<BaseCommand> = baseCommandService.baseCommandsToFormList(inputBaseCommand);
            expect(result).toEqual([
                { class: "Expression", engine: "cwl-js-engine", script: "string"},
                "string 1 string 2",
                { class: "Expression", engine: "cwl-js-engine", script: "string 3"},
                "string 4 string 5",
                { class: "Expression", engine: "cwl-js-engine", script: "string 6"},
                "string 7"
            ]);
        });


        /*it("Should put a string command input into an array", () => {
            const result: Array<string | Object> = baseCommandService.baseCommandsToFormList("echo");
            expect(result).toEqual(["echo"]);
        });*/
    });


    describe("addCommand", () => {
        it("Should add a new base command to the baseCommands stream", (done) => {
            baseCommandService.addCommand("echo");
            baseCommandService.addCommand("cat");
            baseCommandService.addCommand("grep");

            baseCommandService.baseCommands
                .subscribe((baseCommands: BaseCommand) => {
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

            baseCommandService.deleteBaseCommand("echo");

            baseCommandService.baseCommands
                .subscribe((baseCommands: BaseCommand) => {
                    expect(baseCommands).toEqual([
                        "cat",
                        "grep"
                    ]);
                    done();
                });
        });
    });

    describe("setSelectedIndex", () => {
        it("Should update the selectedBaseCommand stream", (done) => {
            baseCommandService.addCommand("echo");
            baseCommandService.addCommand("cat");
            baseCommandService.addCommand("grep");

            baseCommandService.setSelectedIndex("echo");

            baseCommandService.selectedBaseCommand
                .subscribe((selectedBaseCommand) => {
                    expect(selectedBaseCommand).toEqual("echo");
                    done();
                });
        });
    });

    describe("updateSelectedCommand", () => {
        it("Should update the selectedBaseCommand stream with the new value", (done) => {
            const command1 = "echo";
            const command2 = "cat";
            const command3 = "cat";

            baseCommandService.addCommand(command1);
            baseCommandService.addCommand(command2);
            baseCommandService.addCommand(command3);

            const newCommand = "echo 123";

            //baseCommandService.setSelectedIndex(command1);

            baseCommandService.updateCommand(0, newCommand);

            baseCommandService.baseCommands
                .subscribe((baseCommands: BaseCommand) => {
                    expect(baseCommands).toEqual([
                        newCommand,
                        command2,
                        command3
                    ]);
                    done();
                });
        });
    });


    describe("setBaseCommands", () => {
        it("Should set the baseCommands to the given list", (done) => {

            baseCommandService.setBaseCommands(["echo", "grep", "cat"]);

            baseCommandService.baseCommands
                .subscribe((baseCommands: BaseCommand) => {
                    expect(baseCommands).toEqual(["echo", "grep", "cat"]);
                    done();
                });
        });
    });

});

