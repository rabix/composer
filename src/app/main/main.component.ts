import {Component, OnInit} from "angular2/core";
import {BlingDirective} from "../directives/bling.directive";
import {BehaviorSubject} from "rxjs/Rx";
import {Subject} from "rxjs/Subject";

@Component({
    selector: "app",
    template: `
        <p>
            App Name: 
            <span ct-bling [speed]="speedStream">{{ title }}</span>
        </p>`,
    directives: [BlingDirective]
})
export class MainComponent implements OnInit {
    private speedStream: BehaviorSubject<number>;

    constructor() {
        this.speedStream = new BehaviorSubject(200);
    }

    ngOnInit(): any {
        setTimeout(() => {
            console.log('Switching to 1s');
            this.speedStream.next(2000);
        }, 2000);

        setTimeout(() => {
            console.log('Next switch');
            this.speedStream.next(1000);
        }, 5000);

        setTimeout(() => {
            console.log('completing');
            this.speedStream.complete();
        }, 6000);

        let sub = new Subject();



    }

    title = "Next-Generation Cottontail";
}
