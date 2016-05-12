import { Observable }     from 'rxjs/Observable';
import { Injectable }     from '@angular/core';
import 'rxjs/add/operator/share';
import Socket = SocketIOClient.Socket;

@Injectable()
export class RxSocketIO {
    private ioSocket;
    
    constructor() {
            this.ioSocket = io('http://localhost:9000');
        
            this.ioSocket.on('error', function(err) {
                console.log('Socket error ' + err);
            });
    }

    emitEvent(event: string, data: any) {
        return Observable.create((observer) => {

            this.ioSocket.on('disconnect', function() {
                console.log('disconnect');
                observer.complete();
            });

            this.ioSocket.emit(event, data, (data) => {
                observer.next(data);
            });

            return () => {
                this.ioSocket.close();
            }
        }).share();
    }
}
