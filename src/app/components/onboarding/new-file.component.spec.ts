import {NO_ERRORS_SCHEMA} from "@angular/core";
import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {By} from "@angular/platform-browser";
import {Observable} from "rxjs/Observable";
import {CreateAppModalComponent} from "../../core/modals/create-app-modal/create-app-modal.component";
import {WorkboxService} from "../../core/workbox/workbox.service";
import {LocalRepositoryService} from "../../repository/local-repository.service";
import {PlatformRepositoryService} from "../../repository/platform-repository.service";

import {ModalService} from "../../ui/modal/modal.service";

import {NewFileTabComponent} from "./new-file.component";

describe("NewFileTabComponent", () => {
    let component: NewFileTabComponent;
    let fixture: ComponentFixture<NewFileTabComponent>;

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule],
            declarations: [NewFileTabComponent],
            providers: [{
                provide: ModalService,
                useValue: {
                    fromComponent() {
                    }
                }
            }, {
                provide: LocalRepositoryService,
                useValue: {
                    getRecentApps() {
                        return Observable.of([]);
                    }
                }
            }, {
                provide: PlatformRepositoryService,
                useValue: {
                    getRecentApps() {
                        return Observable.of([]);
                    }
                }
            }, {
                provide: WorkboxService,
                useValue: {}
            }],
            schemas: [NO_ERRORS_SCHEMA]
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

        const createWorkflowButton = fixture.debugElement.query(By.css("[data-test=create-workflow-btn]"));
        const createToolButton     = fixture.debugElement.query(By.css("[data-test=create-tool-btn]"));

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

    it("should display correct data in recent apps list", () => {
        // Check if recent apps list is populated with right data in right order
        // const check = (apps) => {
        //     for (let i = 0; i < recentAppsComponentsArray.length; i++) {
        //         const app =
        //             recentAppsComponentsArray[i].injector.get(MockNavSearchResultDirective) as MockNavSearchResultDirective;
        //
        //         // Recent apps list is in reverse order (latest app in user preferences is first in the recent apps list...)
        //         const index = recentAppsComponentsArray.length - i - 1;
        //
        //         expect(app.id).toBe(apps[index].id);
        //         expect(app.icon).toBe(apps[index].type === 'Workflow' ? 'fa-share-alt' : 'fa-terminal');
        //         expect(app.title).toBe(apps[index].title);
        //         expect(app.label).toBe(apps[index].label);
        //     }
        // };
        //
        // // Initial data
        // expect(component.recentApps.length).toBe(4);
        //
        // let recentAppsComponentsArray = fixture.debugElement.queryAll(By.directive(MockNavSearchResultDirective));
        // check(recentAppsFakeData1);
        //
        // // Set new data (external change)
        // userPrefServiceStub.put("", recentAppsFakeData2);
        // expect(component.recentApps.length).toBe(5);
        //
        // detectChanges();
        //
        // recentAppsComponentsArray = fixture.debugElement.queryAll(By.directive(MockNavSearchResultDirective));
        // check(recentAppsFakeData2);
    });

    it("should open an appropriate app when click on item in recent apps list", () => {
        // const spyOnOpenRecentApp = spyOn(component, "openRecentApp").and.callThrough();
        // const spyOnGetOrCreateFileTabAndOpenIt = spyOn(workboxServiceStub, "getOrCreateFileTabAndOpenIt");
        //
        // const firstItemInRecentApps = fixture.debugElement.queryAll(By.css("ct-nav-search-result"))[0];
        // firstItemInRecentApps.triggerEventHandler("dblclick", {});
        //
        // // Recent apps list is in reverse order (latest app in user preferences is first in the recent apps list...)
        // const id = recentAppsFakeData1[recentAppsFakeData1.length - 1].id;
        //
        // expect(spyOnOpenRecentApp).toHaveBeenCalledWith(id);
        // expect(spyOnGetOrCreateFileTabAndOpenIt).toHaveBeenCalledWith(id);
    });

});
