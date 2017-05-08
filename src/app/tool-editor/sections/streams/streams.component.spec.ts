import {Component, forwardRef, Input, NO_ERRORS_SCHEMA} from "@angular/core";
import {async, ComponentFixture, fakeAsync, TestBed, tick} from "@angular/core/testing";
import {
    ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR,
    ReactiveFormsModule
} from "@angular/forms";
import {ExpressionModel} from "cwlts/models";
import {StreamsComponent} from "./streams.component";
import {By} from "@angular/platform-browser";
import {SBDraft2ExpressionModel} from "cwlts/models/d2sb"
import {V1ExpressionModel} from "cwlts/models/v1.0";

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
        <input class="form-control"
               data-test="expression-input"
               [value]="value?.toString()"/>
    `
})
class ExpressionInputStubComponent implements ControlValueAccessor {
    value: ExpressionModel;

    @Input()
    context: any;

    @Input()
    readonly: boolean;

    writeValue(obj: any): void {
        this.value = obj;
    }

    registerOnChange(fn: any): void {
    }

    registerOnTouched(fn: any): void {
    }
}

describe("StreamsComponent", () => {
    let component: StreamsComponent;
    let fixture: ComponentFixture<StreamsComponent>;
    let stdin;
    let stdout;
    let stdinEl: HTMLInputElement;
    let stdoutEl: HTMLInputElement;
    let v1Expr: V1ExpressionModel;
    let d2Expr: SBDraft2ExpressionModel;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, FormsModule],
            declarations: [StreamsComponent, ExpressionInputStubComponent],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(fakeAsync(() => {
        fixture   = TestBed.createComponent(StreamsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        stdinEl  = <HTMLInputElement> fixture.debugElement.query(By.css("[data-test='stdin-input'] input")).nativeElement;
        stdoutEl = <HTMLInputElement> fixture.debugElement.query(By.css("[data-test='stdout-input'] input")).nativeElement;

        v1Expr = new V1ExpressionModel("expression");
        d2Expr = new SBDraft2ExpressionModel("expression");

        tick();
    }));

    it("should create", () => {
        expect(component).toBeTruthy("Component could not be instantiated");
    });

    it("should load SBDraft2 stdin and stdout provided", () => {
        component.stdin  = stdin;
        component.stdout = stdout;

        component.ngOnChanges();
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            expect(stdinEl.value).toEqual("expression", "Did not set sbg:draft-2 stdin");
            expect(stdoutEl.value).toEqual("expression", "Did not set sbg:draft-2 stdout");
        });
    });

    it("should load V1 stdin and stdout provided", () => {
        component.stdin  = stdin;
        component.stdout = stdout;

        component.ngOnChanges();
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            expect(stdinEl.value).toEqual("expression", "Did not set v1.0 stdin");
            expect(stdoutEl.value).toEqual("expression", "Did not set v1.0 stdout");
        });
    });

    it("should emit update on stdin and stdout changes", () => {
        const updateSpy = spyOn(component.update, "emit");

        component.stdinControl.setValue(stdin);

        expect(updateSpy.calls.count()).toBe(1, "Did not call update method correct number of times");
    });
});
