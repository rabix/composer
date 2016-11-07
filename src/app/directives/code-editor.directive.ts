import {Directive, Input, Output, ElementRef} from "@angular/core";
import {Observable} from "rxjs";
import Editor = AceAjax.Editor;
import {ComponentBase} from "../components/common/component-base";

require("brace/theme/chrome");
require("brace/mode/json");
require("brace/mode/yaml");
require("brace/mode/javascript");
require("brace/ext/searchbox");

@Directive({
    selector: "[code-editor]"
})
export class CodeEditorDirective extends ComponentBase {

    @Input()
    @Output()
    public content: Observable<string>;

    @Input()
    public language: string;

    private editor: Editor;

    constructor(private elementRef: ElementRef) {
        super();
    }

    ngOnInit() {
        // Instantiate the editor instance inside the target element
        this.editor  = ace.edit(this.elementRef.nativeElement);
        this.tracked = this.editor;

        // Set the theme and language
        this.editor.setTheme("ace/theme/chrome");
        this.editor.session.setMode(`ace/mode/${this.language}`);

        // Hack for disabling the warning message about a deprecated method
        this.editor.$blockScrolling = Infinity;

        // Watch for text on the input stream that is not the same as what we already have in the editor
        const contentChange = this.content.filter(input => input !== this.editor.getValue());
        this.tracked        = contentChange.subscribe(text => this.editor.setValue(text));

        // Listen for changes on the editor, debounce them for 150ms and then push them back into the text stream
        Observable.fromEvent(this.editor as EventTarget, "change")
            .debounceTime(150)
            .map(_ => this.editor.getValue())
            .subscribe(this.content);
    }
}