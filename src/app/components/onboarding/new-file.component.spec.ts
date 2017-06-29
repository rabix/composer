// import {async, ComponentFixture, TestBed} from "@angular/core/testing";
// import {FormsModule, ReactiveFormsModule} from "@angular/forms";
// import {By} from "@angular/platform-browser";
// import {
//     DebugElement, Directive, EventEmitter, HostListener, Input, NO_ERRORS_SCHEMA,
//     Output
// } from "@angular/core";
//
// import "rxjs/add/observable/of";
// import {BehaviorSubject} from "rxjs/BehaviorSubject";
//
// import {ModalService} from "../../ui/modal/modal.service";
// import {WorkboxService} from "../../core/workbox/workbox.service";
//
// import {NewFileTabComponent} from "./new-file.component";
// import {UserPreferencesService} from "../../services/storage/user-preferences.service";
//
// import {CreateAppModalComponent} from "../../core/modals/create-app-modal/create-app-modal.component";
//
// describe("NewFileTabComponent", () => {
//     let component: NewFileTabComponent;
//     let fixture: ComponentFixture<NewFileTabComponent>;
//     let createWorkflowButton: DebugElement;
//     let createToolButton: DebugElement;
//     let modalServiceStub: Partial<ModalService>;
//     let userPrefServiceStub: Partial<UserPreferencesService>;
//     let workboxServiceStub: Partial<WorkboxService>;
//
//
//     let detectChanges: () => void;
//
//     const recentAppsFakeData1 = [{
//         "id": "id1",
//         "label": "label1",
//         "title": "title1",
//         "type": "Workflow"
//     }, {
//         "id": "id2",
//         "label": "label2",
//         "title": "title2",
//         "type": "CommandLineTool"
//     }, {
//         "id": "id3",
//         "label": "label3",
//         "title": "title3",
//         "type": "CommandLineTool"
//     }, {
//         "id": "id4",
//         "label": "label4",
//         "title": "title4",
//         "type": "CommandLineTool"
//     }];
//
//
//     const recentAppsFakeData2 = [{
//         "id": "idNew1",
//         "label": "labelNew1",
//         "title": "titleNew1",
//         "type": "Workflow"
//     }, {
//         "id": "idNew2",
//         "label": "labelNew2",
//         "title": "titleNew2",
//         "type": "CommandLineTool"
//     }, {
//         "id": "idNew3",
//         "label": "labelNew3",
//         "title": "titleNew3",
//         "type": "CommandLineTool"
//     }, {
//         "id": "idNew4",
//         "label": "labelNew4",
//         "title": "titleNew4",
//         "type": "Workflow"
//     }, {
//         "id": "idNew5",
//         "label": "labelNew5",
//         "title": "titleNew5",
//         "type": "CommandLineTool"
//     }
//     ];
//
//     const ModalServiceMock = {
//         fromComponent: (component: any, config: any) => {
//             return {appType: null}
//         }
//     };
//
//     const WorkboxServiceMock = {
//         getOrCreateFileTabAndOpenIt: (id) => {
//         }
//     };
//
//     class UserPreferencesMock {
//         updates = new BehaviorSubject(recentAppsFakeData1);
//         put = (key, value) => {
//             this.updates.next(value);
//         };
//
//         get = () => {
//             return this.updates;
//         }
//     }
//
//     @Directive({
//         selector: 'ct-nav-search-result'
//     })
//     class MockNavSearchResultDirective {
//         @Input() id: string;
//         @Input() title: string;
//         @Input() icon: string;
//         @Input() label: string;
//
//         @Output()
//         open = new EventEmitter<any>();
//
//         @HostListener("dblclick")
//         triggerOpen() {
//             this.open.emit(this.id);
//         }
//     }
//
//
//     beforeEach(async(() => {
//
//         TestBed.configureTestingModule({
//             imports: [FormsModule, ReactiveFormsModule],
//             declarations: [NewFileTabComponent, MockNavSearchResultDirective],
//             providers: [
//                 {
//                     provide: ModalService, useValue: ModalServiceMock
//                 },
//                 {
//                     provide: UserPreferencesService, useValue: new UserPreferencesMock()
//                 },
//                 {
//                     provide: WorkboxService, useValue: WorkboxServiceMock
//                 },
//             ],
//             schemas: [NO_ERRORS_SCHEMA]
//         }).compileComponents();
//     }));
//
//
//     beforeEach(() => {
//         fixture = TestBed.createComponent(NewFileTabComponent);
//         component = fixture.componentInstance;
//
//         createWorkflowButton = fixture.debugElement.query(By.css("[data-test='create-workflow-btn']"));
//         createToolButton = fixture.debugElement.query(By.css("[data-test='create-tool-btn']"));
//
//         modalServiceStub = fixture.debugElement.injector.get(ModalService);
//         userPrefServiceStub = fixture.debugElement.injector.get(UserPreferencesService);
//         workboxServiceStub = fixture.debugElement.injector.get(WorkboxService);
//
//         // Change detection - this line is necessary when testing components with OnPush strategy
//         detectChanges = () => {
//             fixture.changeDetectorRef['_view'].nodes[0].componentView.state |= (1 << 1);
//             fixture.detectChanges();
//         };
//
//         detectChanges();
//     });
//
//     it("should create", () => {
//         expect(component).toBeTruthy("Component could not be instantiated");
//     });
//
//     it("should open a modal for workflow creation", () => {
//         const spyOnOpenAppCreation = spyOn(component, "openAppCreation").and.callThrough();
//         const spyOnFromComponent = spyOn(modalServiceStub, "fromComponent").and.callThrough();
//         createWorkflowButton.triggerEventHandler("click", {});
//
//         expect(spyOnOpenAppCreation).toHaveBeenCalledWith("workflow");
//         expect(spyOnFromComponent).toHaveBeenCalledWith(CreateAppModalComponent, jasmine.anything());
//     });
//
//     it("should open a modal for tool creation", () => {
//         const spyOnOpenAppCreation = spyOn(component, "openAppCreation").and.callThrough();
//         const spyOnFromComponent = spyOn(modalServiceStub, "fromComponent").and.callThrough();
//         createToolButton.triggerEventHandler("click", {});
//
//         expect(spyOnOpenAppCreation).toHaveBeenCalledWith("tool");
//         expect(spyOnFromComponent).toHaveBeenCalledWith(CreateAppModalComponent, jasmine.anything());
//     });
//
//
//     // it("should display correct data in recent apps list", () => {
//     //     // Check if recent apps list is populated with right data in right order
//     //     const check = (apps) => {
//     //         for (let i = 0; i < recentAppsComponentsArray.length; i++) {
//     //             const app =
//     //                 recentAppsComponentsArray[i].injector.get(MockNavSearchResultDirective) as MockNavSearchResultDirective;
//     //
//     //             // Recent apps list is in reverse order (latest app in user preferences is first in the recent apps list...)
//     //             const index = recentAppsComponentsArray.length - i - 1;
//     //
//     //             expect(app.id).toBe(apps[index].id);
//     //             expect(app.icon).toBe(apps[index].type === 'Workflow' ? 'fa-share-alt' : 'fa-terminal');
//     //             expect(app.title).toBe(apps[index].title);
//     //             expect(app.label).toBe(apps[index].label);
//     //         }
//     //     };
//     //
//     //     // Initial data
//     //     expect(component.recentApps.length).toBe(4);
//     //
//     //     let recentAppsComponentsArray = fixture.debugElement.queryAll(By.directive(MockNavSearchResultDirective));
//     //     check(recentAppsFakeData1);
//     //
//     //     // Set new data (external change)
//     //     userPrefServiceStub.put("", recentAppsFakeData2);
//     //     expect(component.recentApps.length).toBe(5);
//     //
//     //     detectChanges();
//     //
//     //     recentAppsComponentsArray = fixture.debugElement.queryAll(By.directive(MockNavSearchResultDirective));
//     //     check(recentAppsFakeData2);
//     // });
//
//     it("should open an appropriate app when click on item in recent apps list", () => {
//         const spyOnOpenRecentApp = spyOn(component, "openRecentApp").and.callThrough();
//         const spyOnGetOrCreateFileTabAndOpenIt = spyOn(workboxServiceStub, "getOrCreateFileTabAndOpenIt");
//
//         const firstItemInRecentApps = fixture.debugElement.queryAll(By.css("ct-nav-search-result"))[0];
//         firstItemInRecentApps.triggerEventHandler("dblclick", {});
//
//         // Recent apps list is in reverse order (latest app in user preferences is first in the recent apps list...)
//         const id = recentAppsFakeData1[recentAppsFakeData1.length - 1].id;
//
//         expect(spyOnOpenRecentApp).toHaveBeenCalledWith(id);
//         expect(spyOnGetOrCreateFileTabAndOpenIt).toHaveBeenCalledWith(id);
//     });
//
// });
