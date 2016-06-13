import {Injectable} from "@angular/core";
import {UrlValidator} from "../../validators/url.validator"
import {ReferenceType} from "./reference.type"
import {Http, Response} from "@angular/http";
import {Observable} from "rxjs/Observable";
import {HttpService} from "../../services/http/http.service";
import {FileApi} from "../../services/api/file.api";
import {Subject} from "rxjs/Subject";
import {FileModel} from "../../store/models/fs.models";
import {CwlFile} from "../../models/cwl.file.model.ts";
import {FileHelper} from "../../helpers/file.helper";

@Injectable()
export class RefResolverService {
    public refFile: Subject<FileModel> = new Subject<FileModel>();

    constructor(private urlValidator: UrlValidator,
                private httpService: HttpService,
                private fileApi: FileApi) { }

    public resolveRef(referenceString: string, parentPath: string) {
        let isRelative: boolean = FileHelper.isRelativePath(referenceString);

        //If its a URL
        if (this.urlValidator.isValidUrl(referenceString) && !isRelative) {
            this.resolveUrlReference(referenceString, referenceString)

        } else if (this.urlValidator.isValidUrl(parentPath) && isRelative) {
            let absoluteRefPath = FileHelper.relativeToAbsolutePath(referenceString, parentPath);
            this.resolveUrlReference(referenceString, absoluteRefPath)

        } else {
            //If its a file
            let absoluteRefPath: string;
            if (isRelative) {
                absoluteRefPath = FileHelper.relativeToAbsolutePath(referenceString, parentPath)
            } else {
                absoluteRefPath = referenceString;
            }

            this.fileApi.checkIfFileExists(absoluteRefPath).subscribe((fileExists) => {
                if (fileExists) {
                    this.fileApi.getFileContent(absoluteRefPath).subscribe((result:FileModel) => {
                        this.refFile.next(result);
                    }, (err) => console.error(err));
                }

            }, (err) => console.error(err));
        }

        return this.refFile;
    }

    public resolveUrlReference(name: string, url: string) {
        this.httpService.getRequest(url).subscribe((res) => {
            let content = JSON.stringify(res.json());

            let file:FileModel = FileModel.createFromObject({
                name: name,
                absolutePath: url,
                content: content
            });

            this.refFile.next(file);
        }, (err) => {
            console.log(err);
        });
    }
}
