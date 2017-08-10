import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import {DirectoryInputInspectorComponent} from "./directory-input-inspector.component";

describe("DirectoryInputInspectorComponent", () => {
    let component: DirectoryInputInspectorComponent;
    let fixture: ComponentFixture<DirectoryInputInspectorComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, FormsModule],
            declarations: [DirectoryInputInspectorComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture   = TestBed.createComponent(DirectoryInputInspectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should be created", () => {
        expect(component).toBeTruthy();
    });
});
