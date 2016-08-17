import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {Observable} from "rxjs/Rx";

@Injectable()
export class HttpService {

    constructor(private http: Http) {
    }

    public getRequest(url: string): Observable<any> {
        return this.http.get(url)
            .map(this.extractData)
            .catch(this.handleError);
    }

    private extractData(res: Response) {
        return res || {};
    }

    private handleError(error: any) {
        console.debug("Trying to handle an error");
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg);
        return Observable.throw(errMsg);
    }
}
