import { Injectable }     from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable }     from 'rxjs/Observable';
import * as io from 'socket.io-client';

@Injectable()
export class FileApi {

    constructor (private http: Http) {}

    private socket = io('http://localhost:9000');

    getFilesInWorkspace(): Observable<any[]> {
        return Observable.create(observer => {
                this.socket.emit('getFilesInWorkspace', (data) => {
                    observer.next(data)
                });
                return {
                    unsubscribe : this.socket.close
                }
            })
            .map(this.extractData)
            .catch(this.handleError);
    }

    getFilesInWorkspace(): Observable<any[]> {
        return Observable.create(observer => {
                this.socket.emit('createFile', {
                    
                });
                return {
                    unsubscribe : this.socket.close
                }
            })
            .catch(this.handleError);
    }

    private extractData(res: Response) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
        }
        return res || { };
    }

    private handleError (error: any) {
        // In a real world app, we might send the error to remote logging infrastructure
        let errMsg = error.message || 'Server error';
        console.error(errMsg); // log to console instead
        return Observable.throw(errMsg);
    }
}
