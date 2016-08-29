import {Injectable} from "@angular/core";
import {FileModel} from "../store/models/fs.models";

@Injectable()
export class ToolValidator {

    private supportedFileType = [".js", ".yaml", ".yml", ".cwl", ".json"];

    public isSupportedFileFormat(file: FileModel): boolean {
        const fileTypeIndex: number = this.supportedFileType.indexOf(file.type);
        return fileTypeIndex > -1;
    }
}
