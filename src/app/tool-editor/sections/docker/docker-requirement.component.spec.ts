import {DockerRequirementComponent} from "./docker-requirement.component";
import {ComponentFixture, TestBed, async, fakeAsync, tick} from "@angular/core/testing";
import {By} from "@angular/platform-browser";
import {DockerRequirementModel} from "cwlts/models";
import {Component} from "@angular/core";
import {ReactiveFormsModule, FormsModule} from "@angular/forms";

@Component({
    selector: "ct-form-panel",
    template: `
        <ng-content></ng-content>`
})
class MockFormPanelComponent {
}

describe("DockerRequirementComponent", () => {
    let component: DockerRequirementComponent;
    let fixture: ComponentFixture<DockerRequirementComponent>;
    let el: HTMLInputElement;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DockerRequirementComponent, MockFormPanelComponent],
            imports: [ReactiveFormsModule, FormsModule]
        }).compileComponents();
    }));

    beforeEach(fakeAsync(() => {
        fixture   = TestBed.createComponent(DockerRequirementComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
        tick();
    }));

    it("should create", () => {
        expect(component).toBeTruthy("Component could not be instantiated");
    });

    it("should write blank value to input field if dockerRequirement is null", () => {
        component.docker = null;
        component.ngOnChanges();
        fixture.detectChanges();

        el = fixture.debugElement.query(By.css("[data-test='docker-pull-input']")).nativeElement;

        expect(el.value).toEqual("", "Did not set blank value to input field for null docker");
    });

    it("should write dockerRequirement.dockerPull to input field", () => {
        component.docker = new DockerRequirementModel({
            class: "DockerRequirement",
            dockerPull: "ubuntu"
        });

        fixture.detectChanges();

        fixture.whenStable().then(() => {
            el = fixture.debugElement.query(By.css("[data-test='docker-pull-input']")).nativeElement;
            expect(el.value).toEqual("ubuntu", "Did not set dockerPull value on input field");
        });
    });

    it("should emit an output on input change", () => {
        el = fixture.debugElement.query(By.css("[data-test='docker-pull-input']")).nativeElement;

        const updateSpy = spyOn(component, "updateDockerPull");

        el.value = "ubuntu";
        el.dispatchEvent(new Event("input"));
        fixture.detectChanges();

        expect(updateSpy.calls.count()).toBe(1, "Did not call update method correct number of times");
        expect(component.updateDockerPull).toHaveBeenCalledWith("ubuntu");
    });

    it("should update docker.dockerPull with updateDockerPull method", () => {
        component.updateDockerPull("ubuntu");

        fixture.whenStable().then(() => {
            expect(component.docker.dockerPull).toBe("ubuntu", "Did not update dockerPull on updateDockerPull");
        });
    });

    it("should be enabled if not readonly", () => {
        component.readonly = false;
        fixture.detectChanges();

        expect(component.readonly).toEqual(false);

        el = fixture.debugElement.query(By.css("[data-test='docker-pull-input']")).nativeElement;
        fixture.whenStable().then(() => {
            expect(el.disabled).toBeFalsy("Did not enable on !readonly");
        })
    });

    it("should be disabled if readonly", () => {
        component.readonly = true;
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            el = fixture.debugElement.query(By.css("[data-test='docker-pull-input']")).nativeElement;
            expect(el.disabled).toBe(true, "Did not disable on readonly");
        });

    });
});
