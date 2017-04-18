import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {By} from "@angular/platform-browser";
import {DebugElement, NO_ERRORS_SCHEMA} from "@angular/core";
import {noop} from "rxjs/util/noop";
import "rxjs/add/observable/of";

import {ModalService} from "../../ui/modal/modal.service";
import {SystemService} from "../../platform-providers/system.service";
import {WelcomeTabComponent} from "./welcome.component";
import {AddSourceModalComponent} from "../../core/modals/add-source-modal/add-source-modal.component";

describe("WelcomeComponent", () => {
    let component: WelcomeTabComponent;
    let fixture: ComponentFixture<WelcomeTabComponent>;
    let openProjectButton: DebugElement;
    let infoLink: DebugElement;
    let systemServiceStub: Partial<SystemService>;
    let modalServiceStub: Partial<ModalService>;

    let detectChanges: () => void;

    const ModalServiceMock = {
        fromComponent: (component: any, config: any) => {
            return {}
        }
    };

    const SystemServiceMock = {
        openLink: noop
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule],
            declarations: [WelcomeTabComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                {
                    provide: ModalService, useValue: ModalServiceMock
                },
                {

                    provide: SystemService, useValue: SystemServiceMock
                }
            ]
        }).compileComponents();
    }));


    beforeEach(() => {
        fixture = TestBed.createComponent(WelcomeTabComponent);
        component = fixture.componentInstance;

        openProjectButton = fixture.debugElement.query(By.css("[data-test='open-project-btn']"));
        infoLink = fixture.debugElement.query(By.css("[data-test='info-link']"));

        systemServiceStub = fixture.debugElement.injector.get(SystemService);
        modalServiceStub = fixture.debugElement.injector.get(ModalService);

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

    it("should open info link in browser", () => {
        const spy = spyOn(systemServiceStub, "openLink");

        infoLink.triggerEventHandler("click", {});

        expect(spy).toHaveBeenCalledWith("http://rabix.io/");
    });

    it("should open modal when click on 'Open a Project' button", () => {
        const spy = spyOn(modalServiceStub, "fromComponent");

        openProjectButton.triggerEventHandler("click", {});

        expect(spy).toHaveBeenCalledWith(AddSourceModalComponent, {
            title: "Open a Project",
            backdrop: true
        });
    });
});
