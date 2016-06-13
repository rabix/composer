import {Injectable} from "@angular/core";

@Injectable()
export class UrlValidator {
    constructor() { }

    public isValidUrl(url: string): boolean {
        var pattern = new RegExp('^((http|https):\\/\\/)'+ // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,})' +
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
            '(\\#[-a-z\\d_]*)?$','i'); // fragment locator

        return pattern.test(url);
    }
}
