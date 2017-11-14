import {Component, forwardRef, Input, NO_ERRORS_SCHEMA} from "@angular/core";
import {async, ComponentFixture, fakeAsync, TestBed, tick} from "@angular/core/testing";
import {ControlValueAccessor, FormArray, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from "@angular/forms";
import {By} from "@angular/platform-browser";
import {ExpressionModel} from "cwlts/models";
import {SBDraft2ExpressionModel} from "cwlts/models/d2sb";
import {ModalService} from "../../../../ui/modal/modal.service";

import {BaseCommandListComponent} from "./base-command-list.component";

@Component({
    selector: "ct-expression-input",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ExpressionInputStubComponent),
            multi: true
        }
    ],
    template: `
        <div data-test="expression-input"></div>`
})
class ExpressionInputStubComponent implements ControlValueAccessor {
    @Input()
    context: any;

    @Input()
    readonly: boolean;

    writeValue(obj: any): void {
    }

    registerOnChange(fn: any): void {
    }

    registerOnTouched(fn: any): void {
    }
}

const modalServiceStub = {
    delete: () => {
        return new Promise((res) => {
            res(true);
        });
    }
};

describe("BaseCommandListComponent", () => {
    let component: BaseCommandListComponent;
    let fixture: ComponentFixture<BaseCommandListComponent>;
    let mockModel: any;
    let d2expr: ExpressionModel;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [BaseCommandListComponent, ExpressionInputStubComponent],
            providers: [{provide: ModalService, useValue: modalServiceStub}],
            imports: [ReactiveFormsModule, FormsModule],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(fakeAsync(() => {
        fixture   = TestBed.createComponent(BaseCommandListComponent);
        component = fixture.componentInstance;

        d2expr    = new SBDraft2ExpressionModel("expression");
        mockModel = {
            baseCommand: [d2expr, d2expr, d2expr],
            addBaseCommand: () => {
            },
            updateBaseCommand: () => {

            }
        };

        fixture.detectChanges();
        tick();
    }));

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should display blank state if baseCommand is empty", () => {
        const blankStateEl = fixture.debugElement.query(By.css("ct-blank-tool-state"));

        expect(blankStateEl).toBeTruthy();
    });

    it("should load a list of draft-2 expression models", () => {
        component.baseCommand = mockModel.baseCommand;
        component.model       = mockModel;
        component.ngOnChanges();
        fixture.detectChanges();

        expect((component.form.get("list") as FormArray).controls.length).toEqual(3, "Incorrect number of expression inputs created");
    });

    it("should add an expression to the list by calling the model", () => {
        const addCmdSpy = spyOn(mockModel, "addBaseCommand");
        component.model = mockModel;

        component.addBaseCommand();

        expect(addCmdSpy.calls.count()).toEqual(1, "model.addBaseCommand called incorrect number of times");
    });

    it("should remove an expression to the list", () => {
        component.baseCommand = mockModel.baseCommand;
        component.model       = mockModel;
        component.ngOnChanges();
        fixture.detectChanges();

        component.removeBaseCommand(0);
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect((component.form.get("list") as FormArray).controls.length).toEqual(2, "Did not remove baseCommand");
        });

    });

    it("should remove the correct expression form the list", () => {
        component.baseCommand = [
            new SBDraft2ExpressionModel("one"),
            new SBDraft2ExpressionModel("two"),
            new SBDraft2ExpressionModel("three")
        ];
        component.model       = mockModel;
        component.ngOnChanges();
        fixture.detectChanges();

        component.removeBaseCommand(1);
        fixture.detectChanges();

        fixture.whenStable().then(() => {

            expect((component.form.get("list") as FormArray).controls.length).toEqual(2, "Did not remove baseCommand");
            expect((component.form.get("list") as FormArray).controls[0].value.toString()).toEqual("one");
            expect((component.form.get("list") as FormArray).controls[1].value.toString()).toEqual("three");
        });

    });

    it("should trigger change event on form changes", () => {
        component.baseCommand = mockModel.baseCommand;
        component.model       = mockModel;
        component.ngOnChanges();
        fixture.detectChanges();

        const updateSpy = spyOn(component.update, "emit");

        (component.form.get("list") as FormArray).controls[0].setValue("different value");

        expect(updateSpy.calls.count()).toEqual(1, "Did not call update correct number of times");
    });
});
