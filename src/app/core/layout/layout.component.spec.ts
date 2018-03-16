import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {By} from "@angular/platform-browser";
import {StatusBarService} from "../../layout/status-bar/status-bar.service";
import {DomEventService} from "../../services/dom/dom-event.service";

import {LayoutComponent} from "./layout.component";
import {LayoutService} from "./layout.service";
import {of} from "rxjs/observable/of";

describe("LayoutComponent", () => {
    let component: LayoutComponent;
    let fixture: ComponentFixture<LayoutComponent>;
    let layoutService: Partial<LayoutService>;

    const layoutServiceStub = {
        sidebarHidden: false,
        toggleSidebar: () => {}
    };

    const domEventsStub = {
        onMove: (el) => of([])
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LayoutComponent],
            providers: [
                { provide: LayoutService, useValue: layoutServiceStub },
                { provide: DomEventService, useValue: domEventsStub },
                { provide: StatusBarService, useValue: {} }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LayoutComponent);
        component = fixture.componentInstance;
        layoutService = fixture.debugElement.injector.get(LayoutService);

        fixture.detectChanges();
    });

    it("should hide panel and vertical column", () => {
        const panel = fixture.debugElement.query(By.css(".panel-column")).nativeElement;
        const verticalColumn = fixture.debugElement.query(By.css(".handle-vertical")).nativeElement;

        layoutService.sidebarHidden = true;
        fixture.detectChanges();

        expect(panel.classList.contains("hidden")).toBe(true);
        expect(verticalColumn.classList.contains("hidden")).toBe(true);
    });
});
