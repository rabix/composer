import {NO_ERRORS_SCHEMA} from "@angular/core";
import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {By} from "@angular/platform-browser";
import {NativeModule} from "../../native/native.module";
import {SystemService} from "../../platform-providers/system.service";

import {ModalService} from "../../ui/modal/modal.service";
import {WelcomeTabComponent} from "./welcome.component";
import {PlatformCredentialsModalComponent} from "../modals/platform-credentials-modal/platform-credentials-modal.component";

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
                    provide: ModalService,
                    useValue: {fromComponent: () => void 0}
                },
                {
                    provide: SystemService,
                    useValue: {openLink: () => void 0}
                }
            ]
        }).compileComponents();
    }));


    beforeEach(() => {
        fixture   = TestBed.createComponent(WelcomeTabComponent);
        component = fixture.componentInstance;
    });

    it("should create", () => {
        expect(component).toBeTruthy("Component could not be instantiated");
    });

    it("should open info link in browser", () => {
        const system      = fixture.debugElement.injector.get(SystemService);
        const rabixLink   = fixture.debugElement.query(By.css("[data-test=info-link]"));
        const openLinkSpy = spyOn(system, "openLink");

        rabixLink.triggerEventHandler("click", {});

        expect(openLinkSpy).toHaveBeenCalledTimes(1);

        const firstArg = openLinkSpy.calls.mostRecent().args[0];
        expect(firstArg.startsWith("http://rabix.io")).toBe(true);
    });

    it("should open modal when click on 'Connect to Platform' button", () => {

        const modal = fixture.debugElement.injector.get(ModalService);

        const modalSpy       = spyOn(modal, "fromComponent");
        const openProjectBtn = fixture.debugElement.query(By.css("[data-test='connect-to-platform-btn']"));

        openProjectBtn.triggerEventHandler("click", {});

        expect(modalSpy).toHaveBeenCalledTimes(1);
        expect(modalSpy).toHaveBeenCalledWith(PlatformCredentialsModalComponent, jasmine.anything());
    });
});
