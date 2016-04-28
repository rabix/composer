import {Injectable} from "angular2/core";
import {BehaviorSubject} from "rxjs/Rx";
import {Observable} from "rxjs/Observable";

@Injectable()
export class GreeterListService {

    public listStream: BehaviorSubject<string[]>;

    private currentValues = ["First", "Second", "Third"];


    constructor() {
        this.listStream = new BehaviorSubject(this.currentValues);
    }

    public setValues(list: string[]) {
        this.currentValues = list;
        this.listStream.next(this.currentValues);
    }

    public getList() {
        return Observable.merge(this.listStream);
    }

    public removeValue(value: string) {

        let leftovers = this.currentValues.filter((item) => item !== value);
        this.setValues(leftovers);
    }
}
