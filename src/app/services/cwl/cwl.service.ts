import {Injectable} from "@angular/core";
import {CwlFile} from "../../models/cwl.file.model.ts";
import {ObjectHelper} from "../../helpers/object.helper";
import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";
import * as _ from "lodash";
import {RefResolverService} from "./ref-resolver.service";
import {Subject} from "rxjs/Subject";
import {FileModel} from "../../store/models/fs.models";

@Injectable()
export class CwlService {

    /* todo: this should get updated whenever a reference file is updated and other files should update if this changes */
    private contentRefsSubject: Subject<CwlFile> = new Subject<CwlFile>();

    constructor(private refResolverService: RefResolverService) { }

    /* todo: turn the cwl into string with it's references */
    public getCwlFileContent(fileName: string) { }

    public parseCwlFile(file: FileModel): CwlFile {
        //todo: actually parse by the spec. This only checks for the $include and $import.
        let content = JSON.parse(file.getContent());
        let cwlFile: CwlFile = new CwlFile(file.getName(), content, file.getAbsolutePath());

        ObjectHelper.iterateAll(cwlFile.content, (propName, value, object) => {
            if (propName === "$import" || propName === "$include") {

                this.refResolverService.resolveRef(value, cwlFile.path).subscribe((refFile: FileModel) => {
                    let parsedRefFile:CwlFile = this.parseCwlFile(refFile);
                    cwlFile.contentReferences.push(parsedRefFile);
                }, (err) => {
                    console.error('Error occurred: ' + err);
                });
            }
        });
        return cwlFile;
    }
}
