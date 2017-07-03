// import {async, ComponentFixture, TestBed} from "@angular/core/testing";
// import {FormsModule, ReactiveFormsModule} from "@angular/forms";
// import {By} from "@angular/platform-browser";
// import {DebugElement} from "@angular/core";
// import {noop} from "rxjs/util/noop";
// import "rxjs/add/observable/of";
// import {ReplaySubject} from "rxjs/ReplaySubject";
//
// import {OldAuthService} from "../../auth/auth/auth.service";
// import {ModalService} from "../../ui/modal/modal.service";
// import {SystemService} from "../../platform-providers/system.service";
//
// import {GettingStartedComponent} from "./getting-started.component";
// import {ConnectionState, CredentialsEntry} from "../../services/storage/user-preferences-types";
// import {SendFeedbackModalComponent} from "../../core/modals/send-feedback-modal/send-feedback.modal.component";
//
// describe("GettingStartedComponent", () => {
//     let component: GettingStartedComponent;
//     let fixture: ComponentFixture<GettingStartedComponent>;
//     let newToLink: DebugElement;
//     let learnHowToLink: DebugElement;
//     let getSupportButton: DebugElement;
//     let systemServiceStub: Partial<SystemService>;
//     let authServiceStub: Partial<OldAuthService>;
//     let modalServiceStub: Partial<ModalService>;
//
//     let detectChanges: () => void;
//
//     let modalInstance;
//
//     const ModalServiceMock = {
//         fromComponent: (component: any, config: any) => {
//             return modalInstance;
//         }
//     };
//
//     const AuthServiceMock = {
//         connections: new ReplaySubject<any[]>(1)
//     };
//
//     const SystemServiceMock = {
//         openLink: noop
//     };
//
//     const credentialsMockData1 = [{
//         url: "www.test-vayu.staging.com",
//         hash: "hash",
//         token: "token",
//         profile: "profile",
//         status: ConnectionState.Connected,
//         sessionID: "sessionID",
//         user: {
//             id: "id",
//             email: "email",
//             staff: "staff",
//             username: "username",
//             inactive: "inactive",
//             superuser: "superuser",
//         }
//     }, {
//         url: "igor.sbgenomics.com",
//         hash: "hash",
//         token: "token",
//         profile: "profile",
//         status: ConnectionState.Connected,
//         sessionID: "sessionID",
//         user: {
//             id: "id",
//             email: "email",
//             staff: "staff",
//             username: "username",
//             inactive: "inactive",
//             superuser: "superuser",
//         }
//     }
//     ];
//
//     const credentialsMockData2 = [{
//         url: "www.first-vayu.staging.com",
//         hash: "hash",
//         token: "token",
//         profile: "profile",
//         status: ConnectionState.Connected,
//         sessionID: "sessionID",
//         user: {
//             id: "id",
//             email: "email",
//             staff: "staff",
//             username: "username",
//             inactive: "inactive",
//             superuser: "superuser",
//         }
//     }, {
//         url: "www.second-vayu.staging.com",
//         hash: "hash",
//         token: "token",
//         profile: "profile",
//         status: ConnectionState.Connected,
//         sessionID: "sessionID",
//         user: {
//             id: "id",
//             email: "email",
//             staff: "staff",
//             username: "username",
//             inactive: "inactive",
//             superuser: "superuser",
//         }
//     }
//     ];
//
//     beforeEach(async(() => {
//         TestBed.configureTestingModule({
//             imports: [FormsModule, ReactiveFormsModule],
//             declarations: [GettingStartedComponent],
//             providers: [
//                 {
//                     provide: ModalService, useValue: ModalServiceMock
//                 },
//                 {
//                     provide: OldAuthService, useValue: AuthServiceMock
//                 },
//                 {
//                     provide: SystemService, useValue: SystemServiceMock
//                 },
//             ]
//         }).compileComponents();
//     }));
//
//
//     beforeEach(() => {
//
//         fixture = TestBed.createComponent(GettingStartedComponent);
//         component = fixture.componentInstance;
//
//         newToLink = fixture.debugElement.query(By.css("[data-test='new-to-link']"));
//         learnHowToLink = fixture.debugElement.query(By.css("[data-test='learn-how-to-link']"));
//         getSupportButton = fixture.debugElement.query(By.css("[data-test='get-support-btn']"));
//
//         systemServiceStub = fixture.debugElement.injector.get(SystemService);
//         authServiceStub = fixture.debugElement.injector.get(OldAuthService);
//         modalServiceStub = fixture.debugElement.injector.get(ModalService);
//
//         // Change detection - this line is necessary when testing components with OnPush strategy
//         detectChanges = () => {
//             fixture.changeDetectorRef['_view'].nodes[0].componentView.state |= (1 << 1);
//             fixture.detectChanges();
//         };
//
//         // Reset modal instance before each test
//         modalInstance = {
//             feedbackPlatform: null
//         };
//
//
//         detectChanges();
//     });
//
//     it("should create", () => {
//         expect(component).toBeTruthy("Component could not be instantiated");
//     });
//
//     it("should open 'New to Rabix Composer' link in browser", () => {
//         const spy = spyOn(systemServiceStub, "openLink");
//
//         newToLink.triggerEventHandler("click", {});
//
//         expect(spy).toHaveBeenCalledWith("https://github.com/rabix/cottontail-frontend/wiki/Introduction-to-Rabix-and-Rabix-Composer");
//     });
//
//     it("should open 'Learn how to build a tool' link in browser", () => {
//         const spy = spyOn(systemServiceStub, "openLink");
//
//         learnHowToLink.triggerEventHandler("click", {});
//
//         expect(spy).toHaveBeenCalledWith("https://github.com/rabix/cottontail-frontend/wiki/About-the-tool-editor");
//     });
//
//     it("should open mail client when click on 'Get support' button", () => {
//         authServiceStub.connections.next([]);
//
//         const spyOnOpenFeedBackModal = spyOn(component, "initiateFeedbackDialog").and.callThrough();
//         const spyOnOpenLink = spyOn(systemServiceStub, "openLink");
//         const spyOnFromComponent = spyOn(modalServiceStub, "fromComponent");
//
//         getSupportButton.triggerEventHandler("click", {});
//
//         expect(spyOnOpenFeedBackModal).toHaveBeenCalled();
//
//         expect(spyOnFromComponent).not.toHaveBeenCalled();
//         expect(spyOnOpenLink).toHaveBeenCalledWith("mailto:support@sbgenomics.com?subject=Rabix Composer Feedback");
//
//     });
//
//     it("should open modal when click on 'Get support' button (credentialsMock1)", () => {
//
//         authServiceStub.connections.next(credentialsMockData1);
//
//         const spyOnOpenLink = spyOn(systemServiceStub, "openLink");
//         const spyOnFromComponent = spyOn(modalServiceStub, "fromComponent").and.callThrough();
//
//         getSupportButton.triggerEventHandler("click", {});
//
//         expect(spyOnOpenLink).not.toHaveBeenCalled();
//         expect(spyOnFromComponent).toHaveBeenCalledWith(SendFeedbackModalComponent, {
//             title: "Send Feedback",
//             backdrop: true
//         });
//
//         expect(modalInstance.feedbackPlatform).toEqual(credentialsMockData1[1]);
//
//     });
//
//     it("should open modal when click on 'Get support' button (credentialsMock2)", () => {
//
//         authServiceStub.connections.next(credentialsMockData2 as any);
//
//         const spyOnOpenLink = spyOn(systemServiceStub, "openLink");
//         const spyOnFromComponent = spyOn(modalServiceStub, "fromComponent").and.callThrough();
//
//         getSupportButton.triggerEventHandler("click", {});
//
//         expect(spyOnOpenLink).not.toHaveBeenCalled();
//         expect(spyOnFromComponent).toHaveBeenCalledWith(SendFeedbackModalComponent, {
//             title: "Send Feedback",
//             backdrop: true
//         });
//
//         expect(modalInstance.feedbackPlatform).toEqual(credentialsMockData2[0]);
//     });
//
// });
