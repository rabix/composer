import {async, ComponentFixture, fakeAsync, TestBed, tick} from "@angular/core/testing";

import {BaseCommandStringComponent} from "./base-command-string.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {By} from "@angular/platform-browser";
import Spy = jasmine.Spy;

describe("BaseCommandStringComponent", () => {
    let component: BaseCommandStringComponent;
    let fixture: ComponentFixture<BaseCommandStringComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [BaseCommandStringComponent],
            imports: [ReactiveFormsModule, FormsModule]
        })
            .compileComponents();
    }));

    beforeEach(fakeAsync(() => {
        fixture   = TestBed.createComponent(BaseCommandStringComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        tick();
    }));

    it("should be created", () => {
        expect(component).toBeTruthy();
    });

    it("should set value as a string if baseCommand is an array of strings", () => {
        component.baseCommand = ["one", "two"];

        component.ngOnChanges();
        fixture.detectChanges();

        expect(component.form.controls["baseCommand"].value).toEqual("one two", "did not set correct form value");
    });

    it("should calls sendUpdate when user submits form", () => {
        const input: HTMLInputElement = fixture.debugElement.query(By.css("[data-test='base-command-string']")).nativeElement;
        const form: HTMLFormElement   = fixture.debugElement.query(By.css("[data-test='base-command-form']")).nativeElement;
        const updateSpy               = spyOn(component, "sendUpdate");

        input.value = "one two";
        input.dispatchEvent(new Event("input"));

        expect(updateSpy.calls.count()).toBe(0, "submitted prematurely");

        form.dispatchEvent(new Event("submit"));

        expect(updateSpy.calls.count()).toBe(1, "called submit incorrect number of times");
    });

    it("should return array of strings when submitting", () => {
        const input: HTMLInputElement = fixture.debugElement.query(By.css("[data-test='base-command-string']")).nativeElement;
        const form: HTMLFormElement   = fixture.debugElement.query(By.css("[data-test='base-command-form']")).nativeElement;
        const emitSpy                 = spyOn(component.update, "emit");
        fixture.detectChanges();

        input.value = "one two";
        input.dispatchEvent(new Event("input"));

        fixture.detectChanges();

        form.dispatchEvent(new Event("submit"));

        fixture.whenStable().then(() => {
            expect(emitSpy.calls.count()).toBe(1, "did not emit correct number of responses");
            expect(emitSpy).toHaveBeenCalledWith(["one", "two"]);
        });
    });
});
