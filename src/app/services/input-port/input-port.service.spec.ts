import {inject} from "@angular/core/testing";
import {InputPortService, InputPropertyViewModel} from "./input-port.service";
import {CommandInputParameterModel as InputProperty} from "cwlts/models/d2sb";
import {TestBed} from "@angular/core/testing/test_bed";
import {ExpressionModel} from "cwlts";
import {SandboxService} from "../sandbox/sandbox.service";
import {Observable} from "rxjs/Observable";

describe("InputPortService", () => {

    let inputPortService: InputPortService;
    let sandboxService: SandboxService;

    class FakeSandboxService {

        public submit(code: string) {
            return Observable.of({
                output: eval(code).toString()
            });
        }
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: InputPortService, useClass: InputPortService },
                { provide: SandboxService, useClass: FakeSandboxService },
            ]
        });
    });

    beforeEach(inject([InputPortService, SandboxService],
        (inputPorts: InputPortService, sandbox: SandboxService) => {

            inputPortService = inputPorts;
            sandboxService = sandbox;
        }));

    describe("addInput", () => {
        it("should add the item to the inputPorts stream", (done) => {
            const mockInputPort = new InputProperty();

            inputPortService.addInput(mockInputPort);

            inputPortService.inputPorts
                .subscribe((portList: InputProperty[]) => {
                    expect(portList).toEqual([mockInputPort]);
                    done();
                });
        });
    });

    describe("deleteInputPort", () => {
        it("should remove an item for the list and update the inputPorts stream", (done) => {
            const mockInputPort1 = new InputProperty({ id: "a", type: "string" });
            const mockInputPort2 = new InputProperty({ id: "b", type: "string" });

            inputPortService.addInput(mockInputPort1);
            inputPortService.addInput(mockInputPort2);

            inputPortService.deleteInputPort(0);

            inputPortService.inputPorts
                .subscribe((portList: InputProperty[]) => {
                    expect(portList.length).toEqual(1);
                    expect(portList[0]).toEqual(mockInputPort2);
                    done();
                });
        });
    });

    describe("inputPortListToViewModelList", () => {
        it("Should turn the input port list into a ViewModel list", (done) => {
            const expression = new ExpressionModel({
                script: "1 + 2",
                expressionValue: undefined
            }).getCwlModel();

            const inputProp1 = new InputProperty({ id: "a", type: "string" });
            const inputProp2 = new InputProperty({ id: "b", type: "string" });
            const inputProp3 = new InputProperty({ id: "c", type: "string", inputBinding: { valueFrom: expression} });

            const inputPortList: InputProperty[] = [
                inputProp1,
                inputProp2,
                inputProp3
            ];

            const expectedResult: InputPropertyViewModel[] = [
                {
                    value: "",
                    inputProperty: inputProp1
                },
                {
                    value: "",
                    inputProperty: inputProp2
                },
                {
                    value: "3",
                    inputProperty: inputProp3
                },
            ];

            inputPortService.inputPortListToViewModelList(inputPortList).subscribe((result: InputPropertyViewModel[]) => {
                expect(JSON.stringify(result)).toEqual(JSON.stringify(expectedResult));
                done();
            });
        });
    });

    describe("viewModelListToInputPortList", () => {
        it("Should turn the ViewModel back to the CWL InputPort list", () => {
            const expression = new ExpressionModel({
                script: "1 + 2",
                expressionValue: undefined
            }).getCwlModel();

            const inputProp1 = new InputProperty({ id: "a", type: "string" });
            const inputProp2 = new InputProperty({ id: "b", type: "string" });
            const inputProp3 = new InputProperty({ id: "c", type: "string", inputBinding: { valueFrom: expression} });

            const viewModelList: InputPropertyViewModel[] = [
                {
                    value: "",
                    inputProperty: inputProp1
                },
                {
                    value: "",
                    inputProperty: inputProp2
                },
                {
                    value: "3",
                    inputProperty: inputProp3
                },
            ];

            const expectedResult: InputProperty[] = [
                inputProp1,
                inputProp2,
                inputProp3
            ];

            const result = inputPortService.viewModelListToInputPortList(viewModelList);
            expect(JSON.stringify(result)).toEqual(JSON.stringify(expectedResult));
        });
    });

});
