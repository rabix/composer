import {ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, OnInit} from "@angular/core";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "ct-app-execution-preview",
    styleUrls: ["./app-execution-preview.component.scss"],

    template: `
        <div class="p-1 output" [innerHTML]="content"></div>
    `
})

export class AppExecutionPreviewComponent implements OnInit, OnChanges {
    @Input()
    content: string;

    constructor(private el: ElementRef) {
    }

    ngOnInit() {
    }

    ngOnChanges() {

        setTimeout(() =>{
            const nel     = this.el.nativeElement as Element;
            nel.scrollTop = nel.scrollHeight;
        });
    }
}
