import {Injectable} from "@angular/core";
import {UrlValidator} from "../../validators/url.validator"
import {ReferenceType} from "./reference.type"
import {Http, Response} from "@angular/http";
import {Observable} from "rxjs/Observable";
import {HttpService} from "../../services/http/http.service";
import {FileApi} from "../../services/api/file.api";
import {Subject} from "rxjs/Subject";
import {Subject} from "rxjs/Subject";
import {FileModel} from "../../store/models/fs.models";
import {CwlFile} from "../../models/cwl.file.model.ts";
import {FileHelper} from "../../helpers/file.helper";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observer} from "rxjs/Observer";

@Injectable()
export class RefResolverService {
    constructor(private urlValidator: UrlValidator,
                private httpService: HttpService,
                private fileApi: FileApi) { }

    public resolveRef(referenceString: string, parentPath: string): Observable<FileModel> {
        let that = this;
        return Observable.create(function(observer) {
            let isRelative: boolean = FileHelper.isRelativePath(referenceString);

            //If its a URL
            if (that.urlValidator.isValidUrl(referenceString) && !isRelative) {
                that.resolveUrlReference(referenceString, referenceString, observer)

            } else if (that.urlValidator.isValidUrl(parentPath) && isRelative) {
                let absoluteRefPath = FileHelper.relativeToAbsolutePath(referenceString, parentPath);
                that.resolveUrlReference(referenceString, absoluteRefPath, observer)

            } else {
                //If its a file
                let absoluteRefPath: string;
                if (isRelative) {
                    absoluteRefPath = FileHelper.relativeToAbsolutePath(referenceString, parentPath)
                } else {
                    absoluteRefPath = referenceString;
                }

                that.fileApi.checkIfFileExists(absoluteRefPath).subscribe((fileExists) => {
                    if (fileExists) {
                        that.fileApi.getFileContent(absoluteRefPath).subscribe((result:FileModel) => {
                            observer.next(result);
                        }, (err) => {
                            console.error(err);
                            observer.error(err);
                        });
                    }

                }, (err) => {
                    console.error(err);
                    observer.error(err);
                });
            }
        });
    }

    public resolveUrlReference(name: string, url: string, observer: Observer) {
        this.httpService.getRequest(url).subscribe((res) => {
            let content = JSON.stringify(res.json());

            let file:FileModel = FileModel.createFromObject({
                name: name,
                absolutePath: url,
                content: content
            });
            
            observer.next(file);
        }, (err) => {
            console.log(err);
            observer.error(err);
        });
    }
}
