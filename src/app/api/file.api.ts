import { Injectable }     from '@angular/core';
import { Response } from '@angular/http';
import { Observable }     from 'rxjs/Observable';
import {RxSocketIO} from "./rx-socket.io";

@Injectable()
export class FileApi {
    constructor(private rxSocketIO: RxSocketIO) { }

    getFilesInWorkspace() {
        return Observable.create(observer => {
                let subscriber = this.rxSocketIO.emitEvent('getFilesInWorkspace', null).subscribe(
                    function (data) {
                        observer.next(data);
                    },
                    function (e) {
                        console.log('Error: ' + e.message);
                    });

                setTimeout(function(){
                    subscriber.unsubscribe();
                }, 500);
            })
            .map(this.extractData)
            .catch(this.handleError);
    }

    createFile(file) {
        return Observable.create(observer => {
                let subscriber = this.rxSocketIO.emitEvent('createFile', { file: file }).subscribe(
                    function (data) {
                        observer.next(data);
                    },
                    function (e) {
                        console.log('Error: ' + e.message);
                    });

                setTimeout(function(){
                    subscriber.unsubscribe();
                }, 500);
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
        let errMsg = error.message || 'Server error';
        console.error(errMsg);
        return Observable.throw(errMsg);
    }
}
