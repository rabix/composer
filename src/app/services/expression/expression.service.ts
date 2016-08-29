import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";

@Injectable()
export class ExpressionService {

    /** The input ports stream we expose */
    public expression: Observable<string>;

    private updateExpression: BehaviorSubject<string> = new BehaviorSubject<string>(undefined);

    constructor() {
        this.expression = this.updateExpression
            .publishReplay(1)
            .refCount();
    }

    public setExpression(expression: string): void {
        this.updateExpression.next(expression);
    }
}
