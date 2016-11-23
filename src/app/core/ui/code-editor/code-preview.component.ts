import {Component, Input, ChangeDetectionStrategy, HostBinding, Output} from "@angular/core";
import {Observable} from "rxjs";
import {ComponentBase} from "../../../components/common/component-base";

@Component({
    selector: "ct-code-preview",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ct-code-editor-x 
          [(content)]="contentStream"
          [language]="language"
          [options]="{
            readOnly: true,
            theme: 'ace/theme/monokai',
            showGutter: false,
            behavioursEnabled:false,
            firstLineNumber: false,
            foldStyle: false,
            useWorker: false
        }"></ct-code-editor-x>
    `
})
export class CodePreviewComponent extends ComponentBase {

    @Input()
    public content = "";

    @Input()
    public language = "javascript";

    @Input()
    @HostBinding("style.width.px")
    public width = 500;

    @Input()
    @HostBinding("style.height.px")
    public height = 200;

    @Output()
    public viewReady;

    private contentStream: Observable<string>;

    constructor(){
        super();
    }

    ngOnInit() {
        console.log("Rendered");
        this.contentStream = Observable.of(this.content);
    }

    ngOnDestroy(){
        console.log("Destoying");
    }
}