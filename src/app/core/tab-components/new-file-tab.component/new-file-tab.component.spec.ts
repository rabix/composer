import {NO_ERRORS_SCHEMA} from "@angular/core";
import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {By} from "@angular/platform-browser";
import {Observable} from "rxjs/Observable";
import {RecentAppTab} from "../../../../../electron/src/storage/types/recent-app-tab";
import {ModalService} from "../../../ui/modal/modal.service";
import {CreateAppModalComponent} from "../../modals/create-app-modal/create-app-modal.component";
import {WorkboxService} from "../../workbox/workbox.service";
import {NewFileTabComponent} from "./new-file-tab.component";
import {NewFileTabService} from "./new-file-tab.service";

describe("NewFileTabComponent", () => {
    let component: NewFileTabComponent;
    let fixture: ComponentFixture<NewFileTabComponent>;


    beforeEach(async(() => {

        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule],
            declarations: [NewFileTabComponent],
            providers: [{
                provide: ModalService,
                useValue: {fromComponent: () => void(0)}
            }, {
                provide: WorkboxService,
                useValue: {
                    openTab: () => void(0),
                    getOrCreateAppTab: app => app
                }
            }],
            schemas: [NO_ERRORS_SCHEMA]
        }).overrideComponent(NewFileTabComponent, {
            set: {
                providers: [{
                    provide: NewFileTabService,
                    useValue: {getRecentApps: () => void(0)}
                }]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture   = TestBed.createComponent(NewFileTabComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });


    it("should create", () => {
        expect(component).toBeTruthy("Component could not be instantiated");
    });

    it("should try to open a modal for workflow/tool creation", () => {

        const createWorkflowButton = fixture.debugElement.query(By.css("[data-test=create-workflow-button]"));
        const createToolButton     = fixture.debugElement.query(By.css("[data-test=create-tool-button]"));

        const modalMock    = fixture.debugElement.injector.get(ModalService);
        const modalMockSpy = spyOn(modalMock, "fromComponent");

        {
            createWorkflowButton.triggerEventHandler("click", {});
            const [componentConstructor, , instanceProps] = modalMockSpy.calls.mostRecent().args;
            expect(componentConstructor).toBe(CreateAppModalComponent);
            expect(instanceProps.appType).toEqual("Workflow");
        }

        {
            createToolButton.triggerEventHandler("click", {});
            const [componentConstructor, , instanceProps] = modalMockSpy.calls.mostRecent().args;
            expect(componentConstructor).toBe(CreateAppModalComponent);
            expect(instanceProps.appType).toEqual("CommandLineTool");
        }
    });

    it("should populate a list of recent apps", () => {

        const recentAppsTestData = [
            {
                id: "mock-project/mock-app/mock-revision-1",
                type: "Workflow",
                label: "Workflow Label",
                description: "Workflow Description",
            },
            {
                id: "mock-project/mock-app/mock-revision-2",
                type: "CommandLineTool",
                description: "Tool Description",
                label: "Tool Label",
            },
        ] as RecentAppTab[];

        const serviceMock = fixture.debugElement.injector.get(NewFileTabService);
        spyOn(serviceMock, "getRecentApps").and.returnValue(Observable.of(recentAppsTestData));

        fixture.detectChanges();

        const appListEntries = fixture.debugElement.queryAll(By.css("[data-test=recent-apps-list]"));

        expect(appListEntries.length).toBe(recentAppsTestData.length);
    });

    it("should trigger the opening of an app when an entry from the recent apps list is dblclicked", () => {

        const appEntry    = {id: "test-app-id"};
        const injector    = fixture.debugElement.injector;
        const serviceMock = injector.get(NewFileTabService);
        const workboxMock = injector.get(WorkboxService);

        const openRecentAppSpy = spyOn(component, "openRecentApp").and.callThrough();

        const openTabSpy = spyOn(workboxMock, "openTab").and.returnValue(null);
        spyOn(serviceMock, "getRecentApps").and.returnValue(Observable.of([appEntry]));

        fixture.detectChanges();

        const listElement = fixture.debugElement.query(By.css("[data-test=recent-apps-list]"));
        listElement.triggerEventHandler("dblclick", {});

        expect(openRecentAppSpy).toHaveBeenCalledTimes(1);
        expect(openRecentAppSpy).toHaveBeenCalledWith(appEntry);

        expect(openTabSpy).toHaveBeenCalledTimes(1);
        expect(openTabSpy.calls.mostRecent().args[0].id).toBe(appEntry.id);
    });

});
