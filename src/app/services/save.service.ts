import {Injectable} from "@angular/core";
import {FileApi} from "./api/file.api";
import {FileModel} from "../store/models/fs.models";

@Injectable()
export class SaveService {
    constructor(private fileApi: FileApi) {
        
    }
    
    saveFile(file: FileModel) {
        return this.fileApi.updateFile(file.getAbsolutePath(), file.getContent());
    }
}