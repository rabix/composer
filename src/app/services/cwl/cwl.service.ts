import {Injectable} from "@angular/core";
import {CwlFile, ContentReference} from "../../models/cwl.file.models.ts";
import {ObjectHelper} from "../../helpers/object.helper";
import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";

@Injectable()
export class CwlService {
    private references: Observable<ContentReference>[];

    constructor() { }

    public parseCwlFile(fileContent: string): CwlFile {
        //todo: actually parse by the spec. This only checks for the $include and $import.

        let jsonObject = JSON.parse(fileContent);
        let cwlFile = new CwlFile(jsonObject);

        ObjectHelper.iterateAll(cwlFile.content, (propName, value, object) => {
            if (propName === "$import" || propName === "$include") {
                cwlFile.contentReferences.push(value);
            }
        });

        return cwlFile;
    }

    public getContentReferences(fileName: string) {

    }
}
