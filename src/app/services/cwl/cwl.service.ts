import {Injectable} from "@angular/core";
import {CwlFile} from "../../models/cwl.file.model.ts";
import {ObjectHelper} from "../../helpers/object.helper";
import {Observable} from "rxjs/Observable";
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

    public parseCwlFile(file: FileModel): Observable<CwlFile> {
        //todo: actually parse by the spec. This only checks for the $include and $import.
        let content = JSON.parse(file.content);
        let cwlFile: CwlFile = new CwlFile({
            id: file.name,
            content: content,
            path: file.absolutePath,
            contentReferences: []
        });
        
        let that = this;

        return Observable.create(function(observer) {
            ObjectHelper.iterateAll(cwlFile.content, (propName, value, object) => {
                if (propName === "$import" || propName === "$include") {
                    
                    that.refResolverService.resolveRef(value, cwlFile.path).subscribe((refFile: FileModel) => {
                        that.parseCwlFile(refFile).subscribe((parsedRefFile) => {
                            cwlFile.contentReferences.push(parsedRefFile);
                        }, (err) => observer.error(err));
                    }, (err) => {
                        console.error('Error occurred: ' + err);
                        observer.error(err);
                    });
                }
            });

            observer.next(cwlFile);
        });
    }
}
