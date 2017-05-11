import {async, ComponentFixture, fakeAsync, TestBed} from "@angular/core/testing";
import {By} from "@angular/platform-browser";
import {TimeAgoPipe} from "angular2-moment";
import {Observable} from "rxjs/Observable";

import {LayoutService} from "../../core/layout/layout.service";
import {StatusBarComponent} from "./status-bar.component";
import {StatusBarService} from "./status-bar.service";
import {expressionChangedAfterItHasBeenCheckedError} from "@angular/core/src/view/errors";

describe("StatusBarComponent", () => {
    let component: StatusBarComponent;
    let fixture: ComponentFixture<StatusBarComponent>;
    let layoutService: Partial<LayoutService>;
    let statusBarService: Partial<StatusBarService>;

    const layoutServiceStub = {
        sidebarHidden: false,
        toggleSidebar: () => {}
    };

    const statusBarServiceStub = {
        status: Observable.of([]),
        queueSize: Observable.of([]),
        controls: {
            subscribe: (expr) => {}
        }
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StatusBarComponent, TimeAgoPipe],
            providers: [
                { provide: LayoutService, useValue: layoutServiceStub },
                { provide: StatusBarService, useValue: statusBarServiceStub }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StatusBarComponent);
        component = fixture.componentInstance;
        layoutService = fixture.debugElement.injector.get(LayoutService);
        statusBarService = fixture.debugElement.injector.get(StatusBarService);

        spyOn(layoutService, 'toggleSidebar');
        fixture.detectChanges();
    });

    it("should call toggleSidebar", () => {
        const toggleBtn = fixture.debugElement.query(By.css(".sidebar-toggle"));
        toggleBtn.triggerEventHandler('click', null);
        expect(layoutService.toggleSidebar).toHaveBeenCalled();
    });

    it("should change icon arrow direction", () => {
        const toggleBtnIcon = fixture.debugElement.query(By.css(".sidebar-toggle .fa"));
        layoutService.sidebarHidden = true;
        fixture.detectChanges();
        expect(toggleBtnIcon.nativeElement.classList.contains("fa-angle-double-right")).toBe(true);
    });
});
