import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import * as yaml from 'js-yaml';

@Injectable()
export class ConfigurationService {

    public static configuration: Object

    constructor(private http: Http) { }

    load(configurationPath: string): Promise<Object> {

        var promise = this.http.get(configurationPath).map(res => {
            return yaml.safeLoad(res['_body']);
        }).toPromise();

        promise.catch(error => {
            console.error('Something went wrong. Configuration file is missing.');
        }).then(configuration => {
            ConfigurationService.configuration = configuration;
        });

        return promise;

    }
}