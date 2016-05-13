import {Injectable} from "@angular/core";
import {SocketService} from "./socket.service";
import {SOCKET_REQUESTS} from "./socket-events";
import {FilePath} from "./api-response-types";
import {Observable} from "rxjs/Observable";

@Injectable()
export class FileApi {

    constructor(private socketService: SocketService) {

    }

    getDirContent(path: string = ""): Observable<FilePath[]> {
        return this.socketService.request(SOCKET_REQUESTS.DIR_CONTENT, {
            dir: path
        }).map(response => response.contents);
    }

    // getFilesInWorkspace() {
    //     return this.createObservableFromRxSocketEvent(
    //         this.socketService.emit('getFilesInWorkspace', null))
    //         .map(this.extractData)
    //         .catch(this.handleError);
    // }

    // getDirContent(path: string = "") {
    //     return new Promise((resolve, reject) => {
    //         this.socketService.emit('getDirContents', {
    //             dir: path
    //         }, (data) => {
    //             resolve(data.contents);
    //         });
    //     });
    // }

    // getCWLToolbox() {
    //
    //     this.socketService.emit('getCWLToolbox', null, function () {
    //         console.log("Got callback", arguments);
    //     });
    // }
    //
    // getFile(file) {
    //     return this.createObservableFromRxSocketEvent(
    //         this.socketService.emit('getFile', {file: file}))
    //         .map(this.extractData)
    //         .catch(this.handleError);
    // }
    //
    // updateFile(file, content) {
    //     return this.createObservableFromRxSocketEvent(
    //         this.socketService.emit('updateFile', {file: file, content: content}))
    //         .catch(this.handleError);
    // }
    //
    // createFile(file) {
    //     return this.createObservableFromRxSocketEvent(
    //         this.socketService.emit('createFile', {file: file}))
    //         .catch(this.handleError);
    // }
    //
    //
    // private createObservableFromRxSocketEvent(rxSocketEvent) {
    //     return Observable.create(observer => {
    //         let subscriber = rxSocketEvent.subscribe(
    //             function (data) {
    //                 observer.next(data);
    //             },
    //             function (e) {
    //                 console.log('Error: ' + e.message);
    //             });
    //
    //     });
    // }
    //
    // private extractData(res: Response) {
    //     if (res.status < 200 || res.status >= 300) {
    //         throw new Error('Bad response status: ' + res.status);
    //     }
    //     return res || {};
    // }
    //
    // private handleError(error: any) {
    //     let errMsg = error.message || 'Server error';
    //     console.error(errMsg);
    //     return Observable.throw(errMsg);
    // }
}
