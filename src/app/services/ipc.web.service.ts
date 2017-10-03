import { ReflectiveInjector } from '@angular/core';
import { Injectable } from '@angular/core';

@Injectable()
export class IpcWebService {

    public on(event: string, f: Function) {}
    public send(event: string, data: {id: string, watch: boolean, message: any, data: any}) {}

}