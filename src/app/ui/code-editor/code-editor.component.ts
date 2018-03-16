import {Component, ElementRef, Input, Output, ViewEncapsulation} from "@angular/core";
import * as ace from "brace";
import * as AceAjax from "brace";
import "brace/ext/searchbox";
import "brace/mode/c_cpp";
import "brace/mode/html";


import "brace/mode/java";
import "brace/mode/javascript";
import "brace/mode/json";
import "brace/mode/markdown";
import "brace/mode/python";
import "brace/mode/r";
import "brace/mode/scss";
import "brace/mode/sh";
import "brace/mode/text";
import "brace/mode/typescript";
import "brace/mode/xml";
import "brace/mode/yaml";
import "brace/theme/chrome";
import "brace/theme/monokai";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";

import {DirectiveBase} from "../../util/directive-base/directive-base";
import {ACE_MODE_MAP} from "../code-editor-new/ace-mode-map";
import {fromEvent} from "rxjs/observable/fromEvent";
import {debounceTime, map, filter} from "rxjs/operators";

export interface AceEditorOptions {

    // Editor Options
    selectionStyle?: "line" | "text";
    highlightActiveLine?: boolean;
    highlightSelectedWord?: boolean;
    readOnly?: boolean;
    cursorStyle?: "ace" | "slim" | "smooth" | "wide";
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

/**
 * @deprecated Use Regular CodeEditorComponent
 */
@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-code-editor-x",
    styleUrls: ["./code-editor.component.scss"],
    template: ""
})
export class CodeEditorXComponent extends DirectiveBase {

    /** Stream of raw string content that should be displayed in the editor */
    @Input()
    @Output()
    content: Subject<string>;

    /** Language of the textual content, used for syntax highlighting */
    @Input()
    language: Observable<string> | string;

    /* Instance of the Ace editor */
    editor: AceAjax.Editor;

    @Input()
    options: AceEditorOptions = {};

    @Input()
    readonly = false;


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
            this.editor.session.setMode(`ace/mode/${ACE_MODE_MAP[this.language]}`);

        } else if (this.language.subscribe) {
            this.tracked = this.language.subscribe(lang => {
                this.editor.session.setMode(`ace/mode/${ACE_MODE_MAP[lang] || "text"}`);
            });
        }

        this.options.readOnly = this.readonly;

        this.editor.setOptions(this.options);

        // Hack for disabling the warning message about a deprecated method
        this.editor.$blockScrolling = Infinity;

        // Watch for text on the input stream that is not the same as what we already have in the editor
        const contentChange = this.content.pipe(
            filter(input => input !== this.editor.getValue())
        );

        // Update the editor content whenever something new comes to the stream.
        // We need to set the value on the session because otherwise the whole content will be selected upon setting.
        this.tracked = contentChange.subscribe(text => this.editor.session.setValue(text));

        // Listen for changes on the editor, debounce them for 150ms and then push them back into the text stream
        fromEvent(<any>this.editor, "change").pipe(
            debounceTime(150),
            map(() => this.editor.getValue())
        ).subscribeTracked(this, this.content);
    }

    getEditorInstance() {
        return this.editor;
    }


}
