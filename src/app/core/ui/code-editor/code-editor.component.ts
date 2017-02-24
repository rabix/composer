import {Component, Input, Output, ElementRef} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {ComponentBase} from "../../../components/common/component-base";
import Editor = AceAjax.Editor;
import {ACE_MODES_MAP} from "../../../components/code-editor/code-editor-modes-map";

require("brace/ext/searchbox");
require("brace/theme/chrome");
require("brace/theme/monokai");

require("./code-editor.component.scss");

export interface AceEditorOptions {

    // Editor Options
    selectionStyle?: "line"|"text";
    highlightActiveLine?: boolean;
    highlightSelectedWord?: boolean;
    readOnly?: boolean;
    cursorStyle?: "ace"|"slim"|"smooth"|"wide";
    mergeUndoDeltas?: boolean | "always";
    behavioursEnabled?: boolean;
    wrapBehavioursEnabled?: boolean;
    autoScrollEditorIntoView?: boolean;

    // Renderer options
    hScrollBarAlwaysVisible?: boolean;
    vScrollBarAlwaysVisible?: boolean;
    highlightGutterLine?: boolean;
    animatedScroll?: boolean;
    showInvisibles?: boolean;
    showPrintMargin?: boolean;
    printMarginColumn?: boolean;
    printMargin?: boolean;
    fadeFoldWidgets?: boolean;
    showFoldWidgets?: boolean;
    showLineNumbers?: boolean;
    showGutter?: boolean;
    displayIndentGuides?: boolean;
    fontSize?: number | string;
    fontFamily?: string;
    maxLines?: boolean;
    minLines?: boolean;
    scrollPastEnd?: boolean;
    fixedWidthGutter?: boolean;
    theme?: "string"; // path to a theme e.g "ace/theme/textmate"

    // Mouse Handler Options
    scrollSpeed?: number;
    dragDelay?: number;
    dragEnabled?: boolean;
    focusTimout?: number;
    tooltipFollowsMouse?: boolean;

    // Session Options
    firstLineNumber?: number;
    overwrite?: boolean;
    newLineMode?: boolean;
    useWorker?: boolean;
    useSoftTabs?: boolean;
    tabSize?: number;
    wrap?: boolean;
    foldStyle?: boolean;
    mode?: string; // path to a mode e.g "ace/mode/text"

    // Extension options
    enableMultiselect?: boolean;
    enableEmmet?: boolean;
    enableBasicAutocompletion?: boolean;
    enableSnippets?: boolean;
    spellcheck?: boolean;
    useElasticTabstops?: boolean;
}

@Component({
    selector: "ct-code-editor-x",
    template: ""
})
export class CodeEditorComponent extends ComponentBase {

    /** Stream of raw string content that should be displayed in the editor */
    @Input()
    @Output()
    public content: Subject<string>;

    /** Language of the textual content, used for syntax highlighting */
    @Input()
    public language: Observable<string> | string;

    /* Instance of the Ace editor */
    public editor: Editor;

    @Input()
    public options: AceEditorOptions = {};

    @Input()
    public readonly = false;


    constructor(private elementRef: ElementRef) {
        super();
    }

    ngOnInit() {

        // Instantiate the editor instance inside the target element
        this.editor  = ace.edit(this.elementRef.nativeElement);
        this.tracked = this.editor;

        // Set the theme and language
        this.editor.setTheme("ace/theme/chrome");

        if (typeof this.language === "string") {
            this.editor.session.setMode(`ace/mode/${ACE_MODES_MAP[this.language]}`);

        } else if (this.language.subscribe) {
            this.tracked = this.language.subscribe(lang => {
                this.editor.session.setMode(`ace/mode/${ACE_MODES_MAP[lang] || "text"}`);
            });
        }

        this.options.readOnly = this.readonly

        this.editor.setOptions(this.options);

        // Hack for disabling the warning message about a deprecated method
        this.editor.$blockScrolling = Infinity;

        // Watch for text on the input stream that is not the same as what we already have in the editor
        const contentChange = this.content.filter(input => input !== this.editor.getValue());

        // Update the editor content whenever something new comes to the stream.
        // We need to set the value on the session because otherwise the whole content will be selected upon setting.
        this.tracked = contentChange.subscribe(text => this.editor.session.setValue(text));

        // Listen for changes on the editor, debounce them for 150ms and then push them back into the text stream
        Observable.fromEvent(<any>this.editor, "change")
            .debounceTime(50)
            .map(_ => this.editor.getValue())
            .subscribe(this.content);
    }

    public getEditorInstance() {
        return this.editor;
    }


}
