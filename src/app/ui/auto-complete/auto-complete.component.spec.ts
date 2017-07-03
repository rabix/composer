import {async, ComponentFixture, fakeAsync, TestBed, tick} from "@angular/core/testing";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AutoCompleteComponent} from "./auto-complete.component";
import {SelectComponent} from "./select/select.component";
import {By} from "@angular/platform-browser";

describe("UI", () => {
    describe("AutoCompleteComponent", () => {

        describe("Single-value behavior", () => {
            let component: AutoCompleteComponent;
            let fixture: ComponentFixture<AutoCompleteComponent>;

            beforeEach(async(() => {
                TestBed.configureTestingModule({
                    declarations: [AutoCompleteComponent, SelectComponent],
                    imports: [ReactiveFormsModule, FormsModule]
                }).compileComponents();


            }));
            beforeEach(fakeAsync(() => {
                fixture        = TestBed.createComponent(AutoCompleteComponent);
                component      = fixture.componentInstance;
                component.mono = true;

                fixture.detectChanges();
                tick();
            }));

            it("should instantiate", () => {
                expect(component).toBeTruthy("Component could not be instantiated");
            });

            it("should select a value from the FormControl on init", async(() => {
                const val = "opt2";

                component.setOptions = [
                    {text: "First", value: "opt1"},
                    {text: "Second", value: "opt2"},
                    {text: "Third", value: "opt3"}
                ];

                fixture.detectChanges();

                component.writeValue(val);

                fixture.detectChanges();

                fixture.whenStable().then(() => {
                    const nel: HTMLElement = fixture.debugElement.nativeElement;

                    const item = nel.querySelector(".item");
                    expect(item).toBeDefined();
                    expect(item.getAttribute("data-value")).toBe(val);
                    expect(item.textContent).toBe("Second");
                });

            }));
        });

    });
});
