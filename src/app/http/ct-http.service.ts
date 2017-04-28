import {Injectable} from "@angular/core";
import {ConnectionBackend, Http, RequestOptions, RequestOptionsArgs, Response} from "@angular/http";
import {Observable} from "rxjs/Observable";

@Injectable()
export class CtHttp extends Http {

    private interceptorsAfter = [];

    private interceptorsBefore = [];

    private interceptorsError = [];

    constructor(backend: ConnectionBackend, defaultOptions: RequestOptions) {
        super(backend, defaultOptions);
    }

    get(url: string, options?: RequestOptionsArgs): Observable<Response> {

        this.interceptorsBefore.forEach((before) => before());

        return super.get(url, options).catch((error) => {

            this.interceptorsError.forEach((callback) => callback(error));

            return Observable.throw(error)

        }).do(() => this.interceptorsAfter.forEach((after) => after()))
    }

    post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {

        this.interceptorsBefore.forEach((callback) => callback());

        return super.post(url, body, options).catch((error) => {

            this.interceptorsError.forEach((callback) => callback(error));

            return Observable.throw(error)

        }).do(() => this.interceptorsAfter.forEach((callback) => callback()))
    }


    addBeforeInterceptor(callback: Function) {
        this.interceptorsBefore.push(callback);
    }

    removeBeforeInterceptor(callback: Function) {
        this.interceptorsBefore = this.interceptorsBefore.filter((interceptor) => interceptor !== callback)
    }

    addAfterInterceptor(callback: Function) {
        this.interceptorsAfter.push(callback);
    }

    removeAfterInterceptor(callback: Function) {
        this.interceptorsAfter = this.interceptorsAfter.filter((interceptor) => interceptor !== callback)
    }

    addErrorInterceptor(callback: Function) {
        this.interceptorsError.push(callback);
    }

    removeErrorInterceptor(callback: Function) {
        this.interceptorsError = this.interceptorsError.filter((interceptor) => interceptor !== callback)
    }
}
