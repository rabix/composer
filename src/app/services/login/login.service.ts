import {Injectable} from '@angular/core';
import {CookieService} from 'ngx-cookie';

@Injectable()
export class LoginService {

    constructor(private _cookieService: CookieService){}

    storeToken(): boolean {
        // If there's a token and baseURL in the location bar (i.e.,
        // we just landed here after a successful login), save it and
        // scrub the location bar.
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

        if (!params.hasOwnProperty("api_token")) {
            // Have a query string, but it's not a login callback.
            return false;
        }

        this._cookieService.put("api_token", params["api_token"]);
        history.replaceState({}, '', document.location.origin + document.location.pathname);
    }

    getToken(): string {
        return this._cookieService.get("api_token")
    }

}