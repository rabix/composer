import {Component, forwardRef, Input, NO_ERRORS_SCHEMA} from "@angular/core";
import {async, ComponentFixture, fakeAsync, TestBed, tick} from "@angular/core/testing";
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from "@angular/forms";
import {SBDraft2CommandLineToolModel, SBDraft2ExpressionModel} from "cwlts/models/d2sb";
import {V1CommandLineToolModel, V1ExpressionModel} from "cwlts/models/v1.0";
import {ToolStreamsComponent} from "./tool-streams.component";

@Component({
    selector: "ct-expression-input",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ExpressionInputStubComponent),
            multi: true
        }
    ],
    template: ``
})
class ExpressionInputStubComponent implements ControlValueAccessor {
    @Input()
    context: any;

    @Input()
    readonly: boolean;

    writeValue(obj: any): void {}

    registerOnChange(fn: any): void {}

    registerOnTouched(fn: any): void {}
}

describe("ToolStreamsComponent", () => {
    let component: ToolStreamsComponent;
    let fixture: ComponentFixture<ToolStreamsComponent>;

    let v1Model: V1CommandLineToolModel;
    let sbDraft2Model: SBDraft2CommandLineToolModel;

    let v1Expr: V1ExpressionModel;
    let d2Expr: SBDraft2ExpressionModel;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, FormsModule],
            declarations: [ToolStreamsComponent, ExpressionInputStubComponent],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(fakeAsync(() => {
        fixture   = TestBed.createComponent(ToolStreamsComponent);
        component = fixture.componentInstance;

        v1Expr = new V1ExpressionModel("expression");
        d2Expr = new SBDraft2ExpressionModel("expression");

        v1Model = new V1CommandLineToolModel();
        sbDraft2Model = new SBDraft2CommandLineToolModel();

        tick();
    }));

    it("should create", () => {
        expect(component).toBeTruthy("Component could not be instantiated");
    });

    it("should load SBDraft2 stdin and stdout provided", () => {
        component.stdin  = d2Expr;
        component.stdout = d2Expr;
        component.model = sbDraft2Model;

        fixture.detectChanges();

        const stdinSpy = spyOn(component.form.controls["stdin"], "setValue");
        const stdoutSpy = spyOn(component.form.controls["stdout"], "setValue");

        component.ngOnChanges();
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            expect(stdinSpy.calls.count()).toEqual(1, "Did not set sbg:draft-2 stdin");
            expect(stdoutSpy.calls.count()).toEqual(1, "Did not set sbg:draft-2 stdout");
        });
    });

    it("should load V1 stdin, stdout, stderr provided", () => {
        component.stdin  = v1Expr;
        component.stdout = v1Expr;
        component.stderr = v1Expr;
        component.model = v1Model;

        fixture.detectChanges();

        const stdinSpy = spyOn(component.form.controls["stdin"], "setValue");
        const stdoutSpy = spyOn(component.form.controls["stdout"], "setValue");
        const stderrSpy = spyOn(component.form.controls["stderr"], "setValue");

        component.ngOnChanges();
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            expect(stdinSpy.calls.count()).toEqual(1, "Did not set v1.0 stdin");
            expect(stdoutSpy.calls.count()).toEqual(1, "Did not set v1.0 stdout");
            expect(stderrSpy.calls.count()).toEqual(1, "Did not set v1.0 stderr");
        });
    });

    it("should emit update on stdin and stdout changes", () => {
        component.model = v1Model;
        fixture.detectChanges();

        const updateSpy = spyOn(component.update, "emit");

        component.form.controls["stdin"].setValue(v1Expr);
        fixture.detectChanges();

        expect(updateSpy.calls.count()).toBe(1, "Did not call update method correct number of times");
    });
});
