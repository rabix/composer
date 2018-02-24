import {NO_ERRORS_SCHEMA, ErrorHandler, EventEmitter} from "@angular/core";
import {ComponentFixture, TestBed, async} from "@angular/core/testing";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {By} from "@angular/platform-browser";
import {NativeModule} from "../../native/native.module";
import {WelcomeTabComponent} from "./welcome.component";
import {PlatformCredentialsModalComponent} from "../modals/platform-credentials-modal/platform-credentials-modal.component";
import {LinkOpenerToken} from "../../factories/link-opener.factory";
import {ModalManager, ModalManagerToken} from "../../factories/modal.factory";
import Spy = jasmine.Spy;


describe("WelcomeComponent", () => {
    let component: WelcomeTabComponent;
    let fixture: ComponentFixture<WelcomeTabComponent>;

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule, NativeModule],
            declarations: [WelcomeTabComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                {
                    provide: ErrorHandler,
                    useValue: {
                        handleError(err: any) {
                            fail(err);
                        }
                    }
                },
                {
                    provide: ModalManagerToken,
                    useValue: {
                        open: () => void 0,
                        close: () => void 0
                    } as ModalManager
                },
                {provide: LinkOpenerToken, useValue: jasmine.createSpy()}
            ]
        }).compileComponents();

        fixture   = TestBed.createComponent(WelcomeTabComponent);
        component = fixture.componentInstance;
    }));

    it("should create", () => {
        expect(component).toBeTruthy("Component could not be instantiated");
    });

    it("should open info link in browser", () => {
        const linkOpener = fixture.debugElement.injector.get(LinkOpenerToken) as Spy;
        const rabixLink  = fixture.debugElement.query(By.css("[data-test=info-link]"));

        rabixLink.triggerEventHandler("click", {});

        expect(linkOpener).toHaveBeenCalledTimes(1);

        const firstArg = linkOpener.calls.mostRecent().args[0];
        expect(firstArg.startsWith("http://rabix.io")).toBe(true);
    });

    it("should open modal when click on 'Connect to Platform' button", () => {

        const modal          = fixture.debugElement.injector.get(ModalManagerToken) as ModalManager;
        const modalSpy       = spyOn(modal, "open").and.returnValue({
            submit: new EventEmitter()
        });
        const openProjectBtn = fixture.debugElement.query(By.css("[data-test='connect-to-platform-btn']"));

        openProjectBtn.triggerEventHandler("click", null);

        expect(modalSpy).toHaveBeenCalledTimes(1);
        expect(modalSpy).toHaveBeenCalledWith(PlatformCredentialsModalComponent, jasmine.anything());
    });
});
