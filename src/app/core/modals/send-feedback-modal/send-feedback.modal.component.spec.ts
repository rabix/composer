import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {noop} from "rxjs/util/noop";
import "rxjs/add/observable/of";
import {SendFeedbackModalComponent} from "./send-feedback.modal.component";
import {ModalService} from "../../../ui/modal/modal.service";
import {By} from "@angular/platform-browser";
import {DebugElement} from "@angular/core";
import {PlatformAPIGatewayService} from "../../../auth/api/platform-api-gateway.service";
import {ErrorBarService} from "../../../layout/error-bar/error-bar.service";
import {Observable} from "rxjs/Observable";
import {ConnectionState} from "../../../services/storage/user-preferences-types";


describe("SendFeedBackModal", () => {
    let component: SendFeedbackModalComponent;
    let fixture: ComponentFixture<SendFeedbackModalComponent>;

    let modalServiceStub: Partial<ModalService>;
    let apiGatewayStub: Partial<PlatformAPIGatewayService>;
    let errorBarStub: Partial<ErrorBarService>;

    let sendButtonElement: DebugElement;
    let cancelButtonElement: DebugElement;
    let textAreaElement: DebugElement;
    let ideaElement: DebugElement;
    let thoughtElement: DebugElement;
    let problemElement: DebugElement;

    let detectChanges: () => void;

    let UserPreferencesMock = {
        close: noop
    };

    let APIGatewayMock = {
        forHash: () => {
        }
    };

    let ErrorBarMock = {
        showError: noop
    };

    const feedbackPlatformMockData = {
        url: "igor.sbgenomics.com",
        hash: "hash",
        token: "token",
        profile: "profile",
        status: ConnectionState.Connected,
        sessionID: "sessionID",
        user: {
            id: "id",
            email: "email",
            staff: "staff",
            username: "username",
            inactive: "inactive",
            superuser: "superuser",
        }
    };


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule],
            declarations: [SendFeedbackModalComponent],
            providers: [
                {provide: ModalService, useValue: UserPreferencesMock},
                {provide: PlatformAPIGatewayService, useValue: APIGatewayMock},
                {provide: ErrorBarService, useValue: ErrorBarMock}
            ]
        }).compileComponents();
    }));


    beforeEach(() => {
        fixture = TestBed.createComponent(SendFeedbackModalComponent);
        component = fixture.componentInstance;

        ideaElement = fixture.debugElement.query(By.css("[data-test='idea-region']"));
        problemElement = fixture.debugElement.query(By.css("[data-test='problem-region']"));
        thoughtElement = fixture.debugElement.query(By.css("[data-test='thought-region']"));
        textAreaElement = fixture.debugElement.query(By.css("[data-test='feedback-text']"));
        sendButtonElement = fixture.debugElement.query(By.css("[data-test='send-button']"));
        cancelButtonElement = fixture.debugElement.query(By.css("[data-test='cancel-button']"));

        modalServiceStub = fixture.debugElement.injector.get(ModalService);
        apiGatewayStub = fixture.debugElement.injector.get(PlatformAPIGatewayService);
        errorBarStub = fixture.debugElement.injector.get(ErrorBarService);

        // Change detection - this line is necessary when testing components with OnPush strategy
        detectChanges = () => {
            fixture.changeDetectorRef['_view'].nodes[0].componentView.state |= (1 << 1);
            fixture.detectChanges();
        };

        detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy("Component could not be instantiated");
    });

    it("send button should be disabled when component is initialized", () => {
        expect(sendButtonElement.nativeElement.disabled).toBeTruthy();
    });

    it("send button should be disabled when text area is empty and enabled in other case", () => {

        textAreaElement.nativeElement.value = "Test1";
        textAreaElement.nativeElement.dispatchEvent(new Event("input"));

        detectChanges();

        expect(sendButtonElement.nativeElement.disabled).toEqual(false, "Send button should be enabled");

        textAreaElement.nativeElement.value = "";
        textAreaElement.nativeElement.dispatchEvent(new Event("input"));

        detectChanges();

        expect(sendButtonElement.nativeElement.disabled).toEqual(true, "Send button should be disabled");
    });

    it("should select appropriate feedback option when click on idea, thought, problem ", () => {

        ideaElement.triggerEventHandler("click", {});
        detectChanges();

        expect(component.feedbackType).toBe("idea", "Idea should be selected");
        expect(ideaElement.nativeElement.classList.contains("active")).toBe(true, "Idea should be highlighted");

        thoughtElement.triggerEventHandler("click", {});
        detectChanges();

        expect(component.feedbackType).toBe("thought", "Thought should be selected");
        expect(thoughtElement.nativeElement.classList.contains("active")).toBe(true, "Thought should be highlighted");

        problemElement.triggerEventHandler("click", {});
        detectChanges();

        expect(component.feedbackType).toBe("problem", "Problem should be selected");
        expect(problemElement.nativeElement.classList.contains("active")).toBe(true, "Problem should be highlighted");
    });

    it("should send correct feedback data when click on Send button", () => {

        component.feedbackPlatform = feedbackPlatformMockData;

        const spyOnSendFeedback = spyOn(component, "onSendFeedback").and.callThrough();

        const spyObject = jasmine.createSpyObj("spyObject", ["sendFeedback"]);
        const spyOnSendFeedbackApi = spyObject.sendFeedback.and.returnValue(Observable.of(1));

        const spyOnForHash = spyOn(apiGatewayStub, "forHash").and.returnValue(spyObject);

        const spyOnCloseModal = spyOn(component, "closeModal");
        const spyOnShowError = spyOn(errorBarStub, "showError");

        thoughtElement.triggerEventHandler("click", {});

        textAreaElement.nativeElement.value = "Test1";
        textAreaElement.nativeElement.dispatchEvent(new Event("input"));

        sendButtonElement.triggerEventHandler("click", {});

        expect(spyOnSendFeedbackApi).toHaveBeenCalledWith(component.feedbackPlatform.user.id, component.feedbackType,
            textAreaElement.nativeElement.value, component.feedbackPlatform.url);

        expect(spyOnSendFeedback).toHaveBeenCalled();
        expect(spyOnForHash).toHaveBeenCalledWith(component.feedbackPlatform.hash);
        expect(spyOnCloseModal).toHaveBeenCalled();
        expect(spyOnShowError).not.toHaveBeenCalled();

    });

    it("Should show error when api after clicking on Send button call fails", () => {

        component.feedbackPlatform = feedbackPlatformMockData;

        const spyOnSendFeedback = spyOn(component, "onSendFeedback").and.callThrough();

        const spyObject = jasmine.createSpyObj("spyObject", ["sendFeedback"]);
        const spyOnSendFeedbackApi = spyObject.sendFeedback.and.returnValue(Observable.throw(new Error("Error")));

        const spyOnForHash = spyOn(apiGatewayStub, "forHash").and.returnValue(spyObject);

        const spyOnCloseModal = spyOn(component, "closeModal");
        const spyOnShowError = spyOn(errorBarStub, "showError");

        thoughtElement.triggerEventHandler("click", {});

        textAreaElement.nativeElement.value = "Test1";
        textAreaElement.nativeElement.dispatchEvent(new Event("input"));

        sendButtonElement.triggerEventHandler("click", {});

        expect(spyOnSendFeedbackApi).toHaveBeenCalledWith(component.feedbackPlatform.user.id, component.feedbackType,
            textAreaElement.nativeElement.value, component.feedbackPlatform.url);

        expect(spyOnSendFeedback).toHaveBeenCalled();
        expect(spyOnForHash).toHaveBeenCalledWith(component.feedbackPlatform.hash);
        expect(spyOnCloseModal).not.toHaveBeenCalled();
        expect(spyOnShowError).toHaveBeenCalled();

    });

    it("Should close modal when click on Cancel button", async(() => {
        const spy = spyOn(modalServiceStub, "close");

        cancelButtonElement.triggerEventHandler("click", {});

        expect(spy).toHaveBeenCalled();
    }));

});
