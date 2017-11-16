import { ReflectiveInjector } from '@angular/core';
import { Http, Response, BrowserXhr, RequestOptions, BaseRequestOptions, ResponseOptions, BaseResponseOptions, ConnectionBackend, XHRBackend, XSRFStrategy, CookieXSRFStrategy } from '@angular/http';
import { Injectable } from '@angular/core';
import { ToolHintsComponent } from './../tool-editor/sections/hints/tool-hints.component';
import { Observable } from 'rxjs/Observable';
import { EventEmitter } from '@angular/core';
import * as YAML from "js-yaml";

@Injectable()
export class IpcWebService {

    private _event: EventEmitter<any>;
    private _cntr: IpcWebControler;
    private _http: Http;

    constructor() {
        let injector = ReflectiveInjector.resolveAndCreate([
            Http,
            BrowserXhr,
            {provide: RequestOptions, useClass: BaseRequestOptions},
            {provide: ResponseOptions, useClass: BaseResponseOptions},
            {provide: ConnectionBackend, useClass: XHRBackend},
            {provide: XSRFStrategy, useFactory: () => new CookieXSRFStrategy()},
          ]);

        this._http = injector.get(Http);
        this._event = new EventEmitter();
        this._cntr  = new IpcWebControler(this._http);
    }

    public on(event: string, f: Function) {
        this._event.subscribe( data => {
            setTimeout( () => f(data.sender, data.response), 1000);
        });
    }

    public send(event: string, data: {id: string, watch: boolean, message: any, data: any}) {
        if ( this._cntr[data.message] ) {
            this._cntr[data.message](data.data)
                .subscribe(response_data => {
                    this._event.emit({
                        sender: {
                            sender: this._event
                        },
                        response: {
                            data: response_data,
                            id: data.id
                        }
                    });
                });
        }
    }
}

export class IpcWebControler {
    private _http: Http;

    constructor(http: Http){
        this._http = http;
    }

    public checkForPlatformUpdates(): Observable<any> {
        return Observable.empty(null);
    }

    // data == folder path
    public readDirectory(data: any): Observable<any> {
        //return Observable.empty();
        return this._http.get(data).map(response => response.json());
    }

    public patchLocalRepository(data: any): Observable<any> {
        return Observable.empty().startWith(null);
    }

    public patchUserRepository(data: any): Observable<any> {
        return Observable.empty().startWith(null);
    }

    // data == file path
    public getLocalFileContent(data: any): Observable<any> {
        return this._http.get(data).map(response => response.text());
    }

    /**
     * 
     * @param data Object({content: string, path: string})
     */
    public resolveContent(data: any): Observable<any> {
        let _data = YAML.safeLoad(data.data, {json: true} as any);
        return Observable.empty().startWith(_data);
    }

    /**
     * 
     * @param data Object({local: bool, swapContent: string, swapID: string})
     */
    public patchSwap(data: any): Observable<any> {
        return Observable.empty().startWith(null);
    }

    public watchUserRepository(data: any): Observable<any> {
        return Observable.empty().startWith(null);
    }

    public watchLocalRepository(data: any): Observable<any> {
        switch(data.key) {
            case "openTabs":
            case "recentApps":
                return Observable.empty().startWith([]);

            case "localFolders":
                return Observable.empty().startWith([]);

            case "expandedNodes":
                return Observable.empty().startWith([]);

            case "executorConfig":
                return Observable.empty().startWith({paht: ""});

            case "selectedAppsPanel":
                return Observable.empty().startWith("myApps");

            case "publicAppsGrouping":
                return Observable.empty().startWith('toolkit');

            case "activeCredentials":
                return Observable.empty().startWith(null);

            case "credentials":
                return Observable.empty().startWith([]);

            case "ignoredUpdateVersion":
                return Observable.empty().startWith(null);
        }

        return Observable.empty().delay(2000).startWith([]);
    }
}