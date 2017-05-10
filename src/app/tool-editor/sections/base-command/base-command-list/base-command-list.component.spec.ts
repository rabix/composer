import {NO_ERRORS_SCHEMA} from "@angular/core";
import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import {BaseCommandListComponent} from "./base-command-list.component";


describe("BaseCommandListComponent", () => {
    let component: BaseCommandListComponent;
    let fixture: ComponentFixture<BaseCommandListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [BaseCommandListComponent],
            imports: [ReactiveFormsModule, FormsModule],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture   = TestBed.createComponent(BaseCommandListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
