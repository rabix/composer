import {Injectable} from "@angular/core";
import {UrlValidator} from "../../validators/url.validator"
import {ReferenceType} from "./reference.type"
import {Http, Response} from "@angular/http";
import {Observable} from "rxjs/Observable";
import {HttpService} from "../../services/http/http.service";
import {FileApi} from "../../services/api/file.api";
import {Subject} from "rxjs/Subject";

@Injectable()
export class RefResolverService {
    public content: Subject<any> = new Subject<any>();

    constructor(private urlValidator: UrlValidator,
                private httpService: HttpService,
                private fileApi: FileApi) { }

    public resolveRef(referenceString: string) {
        if (this.urlValidator.isValidUrl(referenceString)) {
            //return this.httpService.getRequest(referenceString);
            this.httpService.getRequest(referenceString).subscribe((res) => {
                this.content.next(res.json());
            }, (err) => {
                console.log(err);
            });
            //this.content.next(content)
        } else {
            this.fileApi.checkIfFileExists(referenceString).subscribe(
                (exists) => {

                    var path = '';
                    if (exists) {
                        this.fileApi.getFileContent(path).subscribe(
                            (content) => {

                            },
                            (err) => {

                            }
                        )
                    }

                }, (err) => {
                    console.error('something wrong occurred: ' + err);
                }, () => {
                    console.log('done');
                });
        }

        return this.content;
    }
}
