import {Injectable} from "@angular/core";
import {AppHelper} from "../../core/helpers/AppHelper";
import {stringifyObject} from "../../helpers/yaml-helper";
import {FileRepositoryService} from "../../file-repository/file-repository.service";
import {NativeSystemService} from "../../native/system/native-system.service";

type ExportFormat = "json" | "yaml";

@Injectable()
export class ExportAppService {

    constructor(private fileRepository: FileRepositoryService, private native: NativeSystemService) {
    }

    chooseExportFile(appID: string, appContent, format: ExportFormat) {

        let defaultPath = `${appID}.cwl`;
        if (appID) {
            if (AppHelper.isLocal(appID)) {
                defaultPath = appID.split(".").slice(0, -1).concat("cwl").join(".");
            } else {
                const [, , appSlug] = appID.split("/");
                defaultPath         = appSlug + ".cwl";
            }
        }

        this.native.createFileChoiceDialog({defaultPath}).then(path => {
            const formatted = stringifyObject(appContent, format);

            return this.fileRepository.saveFile(path, formatted);
        }).then((result) => {
            this.fileRepository.reloadPath(result.dirname);
        }).catch(() => void 0);
    }
}
