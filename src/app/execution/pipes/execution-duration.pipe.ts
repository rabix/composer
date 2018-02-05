import {Pipe, PipeTransform} from "@angular/core";
import * as moment from "moment";

@Pipe({name: "executionDuration"})
export class ExecutionDurationPipe implements PipeTransform {

    transform(value: number, args?: any): any {

        if (isNaN(Number.parseInt(value as any))) {
            return value;
        }

        const leftmostPair = [];

        const time  = moment.duration(value, "milliseconds");
        const order = ["years", "months", "days", "hours", "minutes", "seconds", "milliseconds"];
        const short = ["y", "m", "d", "h", "min", "s", "ms"];


        for (let i = 0; i < order.length; i++) {

            const amount = time.get(order[i] as any);

            if (amount > 0) {
                leftmostPair.push(amount + short[i]);
            }

            if (leftmostPair.length >= 2) {
                break;
            }

        }

        return leftmostPair.join(" ");
    }

}
