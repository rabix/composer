import {Injectable} from "@angular/core";
import {FileModel} from "../store/models/fs.models";

@Injectable()
export class ToolValidator {

    private supportedFileType = [".js", ".yaml", ".yml", ".cwl", ".json"];

    /* TODO: Check for tool type as well, when we have the data */
    public isSupportedFileFormat(file: FileModel) {
        let fileTypeIndex: number = this.supportedFileType.indexOf(file.type);
        return fileTypeIndex > -1;
    }
}
