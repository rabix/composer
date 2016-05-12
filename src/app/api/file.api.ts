import { Injectable }     from '@angular/core';
import { Response } from '@angular/http';
import { Observable }     from 'rxjs/Observable';
import {RxSocketIO} from "./rx-socket.io";

@Injectable()
export class FileApi {
    constructor(private rxSocketIO: RxSocketIO) { }

    getFilesInWorkspace() {
        /*return Observable.create(observer => {
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
            })*/
        return this.createObservableFromRxSocketEvent(
            this.rxSocketIO.emitEvent('getFilesInWorkspace', null))
            .map(this.extractData)
            .catch(this.handleError);
    }

    getCWLToolbox() {
        return this.createObservableFromRxSocketEvent(
            this.rxSocketIO.emitEvent('getCWLToolbox', null))
            .map(this.extractData)
            .catch(this.handleError);
    }

    getFile(file) {
        return this.createObservableFromRxSocketEvent(
            this.rxSocketIO.emitEvent('getFile', { file: file }))
            .map(this.extractData)
            .catch(this.handleError);
    }

    updateFile(file) {
        return this.createObservableFromRxSocketEvent(
            this.rxSocketIO.emitEvent('updateFile', { file: file }))
            .catch(this.handleError);
    }

    createFile(file) {
        return this.createObservableFromRxSocketEvent(
            this.rxSocketIO.emitEvent('createFile', { file: file }))
            .catch(this.handleError);
    }

    
    private createObservableFromRxSocketEvent(rxSocketEvent) {
        return Observable.create(observer => {
                let subscriber = rxSocketEvent.subscribe(
                    function (data) {
                        observer.next(data);
                    },
                    function (e) {
                        console.log('Error: ' + e.message);
                    });

                setTimeout(function(){
                    subscriber.unsubscribe();
                }, 500);
            });
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
