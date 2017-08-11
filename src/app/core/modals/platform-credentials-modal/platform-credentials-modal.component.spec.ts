import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SystemService} from "../../../platform-providers/system.service";
import {AutoCompleteComponent} from "../../../ui/auto-complete/auto-complete.component";
import {CircularLoaderComponent} from "../../../ui/circular-loader/circular-loader.component";
import {ModalService} from "../../../ui/modal/modal.service";
import {DataGatewayService} from "../../data-gateway/data-gateway.service";

import {PlatformCredentialsModalComponent} from "./platform-credentials-modal.component";

describe("PlatformCredentialsModalComponent", () => {
    let component: PlatformCredentialsModalComponent;
    let fixture: ComponentFixture<PlatformCredentialsModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule],
            declarations: [PlatformCredentialsModalComponent, AutoCompleteComponent, CircularLoaderComponent],
            providers: [
                {
                    provide: SystemService,
                    useValue: {}
                }, {
                    provide: DataGatewayService,
                    useValue: {}
                }, {
                    provide: ModalService,
                    useValue: {}
                }]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture   = TestBed.createComponent(PlatformCredentialsModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
