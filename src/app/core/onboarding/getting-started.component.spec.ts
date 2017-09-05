import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {By} from "@angular/platform-browser";
import {Observable} from "rxjs/Observable";
import {AuthService} from "../../auth/auth.service";
import {SystemService} from "../../platform-providers/system.service";
import {ModalService} from "../../ui/modal/modal.service";

import {GettingStartedComponent} from "./getting-started.component";
import {SendFeedbackModalComponent} from "../modals/send-feedback-modal/send-feedback.modal.component";

describe("GettingStartedComponent", () => {
    let component: GettingStartedComponent;
    let fixture: ComponentFixture<GettingStartedComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule],
            declarations: [GettingStartedComponent],
            providers: [{
                provide: ModalService,
                useValue: {
                    fromComponent: () => void 0
                }
            }, {
                provide: AuthService,
                useValue: {
                    getActive: () => void 0
                }
            }, {
                provide: SystemService,
                useValue: {
                    openLink: () => void 0
                }
            }]
        }).compileComponents();
    }));


    beforeEach(() => {

        fixture   = TestBed.createComponent(GettingStartedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy("Component could not be instantiated");
    });

    it("should open 'quickstart for editing Platform workflows' link in browser", () => {

        const wikiLink = "https://github.com/rabix/composer/wiki/Quickstart-for-editing-Platform-workflows";

        const toolDocsLink = fixture.debugElement.query(By.css("[data-test=platform-quickstart-link]"));
        const system       = fixture.debugElement.injector.get(SystemService);
        const linkSpy      = spyOn(system, "openLink");

        toolDocsLink.triggerEventHandler("click", {});

        expect(linkSpy).toHaveBeenCalledWith(wikiLink, jasmine.anything());
    });

    it("should open 'Learn how to build a tool' link in browser", () => {
        const wikiLink = "https://github.com/rabix/composer/wiki/The-tool-editor";

        const toolDocsLink = fixture.debugElement.query(By.css("[data-test=tool-docs-link]"));
        const system       = fixture.debugElement.injector.get(SystemService);
        const linkSpy      = spyOn(system, "openLink");

        toolDocsLink.triggerEventHandler("click", {});

        expect(linkSpy).toHaveBeenCalledWith(wikiLink, jasmine.anything());
    });

    it("should open mail client when click on 'Get support' button if there is no active user", () => {

        const auth = fixture.debugElement.injector.get(AuthService);
        spyOn(auth, "getActive").and.returnValue(Observable.of(undefined));

        const system   = fixture.debugElement.injector.get(SystemService);
        const mailLink = spyOn(system, "openLink");

        const getSupportBtn = fixture.debugElement.query(By.css("[data-test=get-support-btn]"));
        getSupportBtn.triggerEventHandler("click", {});

        expect(mailLink).toHaveBeenCalledTimes(1);
        //
        const callArgs = mailLink.calls.mostRecent().args;
        const callURL  = callArgs[0] as string;
        expect(callURL.startsWith("mailto:support@sbgenomics.com")).toBe(true);
    });

    it("should open a feedback modal when click on 'Get support' if there is an active user", () => {

        const auth         = fixture.debugElement.injector.get(AuthService);
        spyOn(auth, "getActive").and.returnValue(Observable.of({}));

        const modal    = fixture.debugElement.injector.get(ModalService);
        const modalSpy = spyOn(modal, "fromComponent");

        const getSupportBtn = fixture.debugElement.query(By.css("[data-test=get-support-btn]"));
        getSupportBtn.triggerEventHandler("click", {});

        expect(modalSpy).toHaveBeenCalledWith(SendFeedbackModalComponent, jasmine.anything());
    });
});
