import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/Rx";
import {Observable} from "rxjs/Observable";

@Injectable()
export class GreeterListService {

    public listStream: BehaviorSubject<string[]>;

    private currentValues = ["First", "Second", "Third"];


    constructor() {
        this.listStream = new BehaviorSubject<string[]>(this.currentValues);
    }

    public setValues(list: string[]) {
        this.currentValues = list;
        this.listStream.next(this.currentValues);
    }

    public getList(): Observable<string[]> {
        return this.listStream;
    }

    public removeValue(value: string) {

        let leftovers = this.currentValues.filter((item) => item !== value);
        this.setValues(leftovers);
    }
}
