import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {AppsPanelComponent} from "./apps-panel.component";

describe("AppsPanelComponent", () => {
    let component: AppsPanelComponent;
    let fixture: ComponentFixture<AppsPanelComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AppsPanelComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture   = TestBed.createComponent(AppsPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
