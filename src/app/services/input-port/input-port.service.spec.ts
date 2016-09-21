import {inject} from "@angular/core/testing";
import {InputPortService} from "./input-port.service";
import {CommandInputParameterModel as InputProperty} from "cwlts/lib/models/d2sb";
import {TestBed} from "@angular/core/testing/test_bed";

describe("InputPortService", () => {

    let inputPortService: InputPortService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: InputPortService, useClass: InputPortService }
            ]
        });
    });

    beforeEach(inject([InputPortService], (inputPorts: InputPortService) => {
        inputPortService = inputPorts;
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

            inputPortService.deleteInputPort(mockInputPort1);

            inputPortService.inputPorts
                .subscribe((portList: InputProperty[]) => {

                    expect(portList.length).toBe(1);
                    expect(portList[0]).toBe(mockInputPort2);
                    done();
                });
        });
    });

    describe("setSelected", () => {
        it("should update the selectedInputPort stream", (done) => {
            const mockInputPort1 = new InputProperty({ id: "a", type: "string" });

            inputPortService.setSelected(mockInputPort1);

            inputPortService.selectedInputPort
                .subscribe((inputProp: InputProperty) => {
                    expect(inputProp).toBe(mockInputPort1);
                    done();
                });
        })
    });

});
