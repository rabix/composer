import {NativeSystemService} from "./native-system.service";

describe("NativeSystemService", () => {

    let service: NativeSystemService;
    let getRemote: Function;
    let remote = {
        app: {getPath: () => void 0},
        dialog: {showOpenDialog: () => void 0},
        getCurrentWindow: () => window
    };

    beforeEach(() => {
        getRemote = () => remote;
        service   = new NativeSystemService({getRemote} as any);
    });

    it("should call directory dialog", () => {
        const dialogSpy = spyOn(remote.dialog, "showOpenDialog");
        service.openFolderChoiceDialog();
        expect(dialogSpy).toHaveBeenCalled();
    });

});
