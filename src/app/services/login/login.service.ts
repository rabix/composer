import {Injectable} from '@angular/core';
import {CookieService} from 'ngx-cookie';

@Injectable()
export class LoginService {

    constructor(private _cookieService: CookieService){}

    storeToken(token: string): boolean {
        if (document.location.search[0] != '?') {
            return false;
        }

        var params = {};
        document.location.search.slice(1).split('&').map(function(kv) {
            var e = kv.indexOf('=');
            if (e < 0) {
                return false;
            }

            params[decodeURIComponent(kv.slice(0, e))] = decodeURIComponent(kv.slice(e+1));
        })

        if (!params.hasOwnProperty(token)) {
            return false;
        }

        this._cookieService.put(token, params[token]);
        history.replaceState({}, '', document.location.origin + document.location.pathname);
    }

    getToken(token: string): string {
        return this._cookieService.get(token)
    }

    logout(token: string): void {
        this._cookieService.remove(token)
        document.location.href = document.location.href
    }

}