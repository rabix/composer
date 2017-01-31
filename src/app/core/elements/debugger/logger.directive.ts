import {Directive, Input} from "@angular/core";

@Directive({
    selector: "[ct-logger]"
})
export class LoggerDirective {
    @Input("ct-logger")
    public data: any;

    @Input("ct-logger-title")
    public title = "Logger";

    private log(name) {
        console.log(name, this.title, ":", this.data);
    }

    ngOnInit() {
        this.log("INIT");
    }

    ngOnChanges() {
        this.log("CHANGE");
    }
}
