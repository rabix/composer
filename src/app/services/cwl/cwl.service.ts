import {Injectable} from "@angular/core";
import {CwlFile, ContentReference} from "../../models/cwl.file.models.ts";
import {ObjectHelper} from "../../helpers/object.helper";
import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";
import * as _ from "lodash";
import {RefResolverService} from "./ref-resolver.service";
import {Subject} from "rxjs/Subject";

@Injectable()
export class CwlService {

   /** todo: this should get updated whenever a reference file is updated and other files should update if this changes */
    public contentRefsSubject: Subject<ContentReference> = new Subject<ContentReference>();

    constructor(private refResolverService: RefResolverService) { }

    /* todo: turn the cwl into string with it's references */
    public getCwlFileContent(fileName: string) { }

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

    public getContentReferences(cwlFile: CwlFile) {
        _.forEach(cwlFile.contentReferences, (contentReference) => {

            this.refResolverService.resolveRef(contentReference).subscribe(
                (content) => {
                    let cwlFile = this.parseCwlFile(JSON.stringify(content));

                    let contentRef: ContentReference = {
                        refId: contentReference,
                        cwlFile: cwlFile
                    };

                    console.log('contentRef refId ' + contentRef.refId);
                    console.log('contentRef cwlFile ' + contentRef.cwlFile);

                    this.contentRefsSubject.next(contentRef);
                }, (err) => {
                    console.error('something wrong occurred: ' + err);
                }, () => {
                    console.log('done');
                });
        });
    }
}
