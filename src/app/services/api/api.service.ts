import {APP_CONFIG, AppConfig} from "../../config/app.config";
import {Http, Response, URLSearchParams} from "@angular/http";
import {Injectable, Inject} from "@angular/core";
import {Observable} from "rxjs/Observable";
import * as ResponseTypes from "./api-response-types";

@Injectable()
export class ApiService {

    private endpoint: string;

    constructor(private http: Http,
                @Inject(APP_CONFIG) private config: AppConfig) {

        this.endpoint = `${config.protocol}://${config.hostname}:${config.port}/api`;

    }

    public getDirectoryContent(dir: string = ""): Observable<ResponseTypes.FilePath[]> {

        let searchParams = new URLSearchParams();
        searchParams.set("dir", dir);

        return this.http.get(`${this.endpoint}/fs/dir`, {search: searchParams})
            .map((body: Response) => body.json())
            .map((response: ResponseTypes.FS) => response.paths);
    }
}
