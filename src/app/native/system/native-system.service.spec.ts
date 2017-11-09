import {inject, TestBed} from "@angular/core/testing";
import {ElectronProxyService} from "../proxy/electron-proxy.service";
import {NativeSystemService} from "./native-system.service";


describe("NativeSystemService", () => {

    const remoteMock = {
        app: {getPath: () => void 0},
        dialog: {showOpenDialog: () => void 0}
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [NativeSystemService, {
                provide: ElectronProxyService,
                useValue: {getRemote: () => remoteMock}
            }]
        });
    });


    it("should be created", inject([NativeSystemService], (service: NativeSystemService) => {
        expect(service).toBeTruthy();
    }));

    it("should call directory dialog", inject(
        [NativeSystemService, ElectronProxyService],
        (service: NativeSystemService,
         proxy: ElectronProxyService) => {

            const dialogSpy = spyOn(proxy.getRemote().dialog, "showOpenDialog");
            service.openFolderChoiceDialog();

            expect(dialogSpy).toHaveBeenCalled();
        }));

});
