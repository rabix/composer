import {ChangeDetectionStrategy, Component, ElementRef, forwardRef, Input, OnInit, SimpleChanges} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import "brace/mode/java";
import "brace/mode/javascript";
import "brace/mode/json";
import "brace/mode/markdown";
import "brace/mode/python";
import "brace/mode/sh";
import "brace/mode/text";
import "brace/mode/typescript";
import "brace/mode/yaml";
import "brace/mode/c_cpp";
import "brace/mode/scss";
import "brace/mode/html";
import "brace/mode/xml";
import "brace/mode/r";
import "brace/theme/chrome";
import "brace/theme/monokai";
import "brace/ext/searchbox";
import "brace/ext/modelist";
import "brace/ext/language_tools";

import {AceEditorOptions} from "./ace-editor-options";

@Component({
    selector: "ui-code-editor",
    template: "",
    styleUrls: ["./code-editor.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CodeEditorComponent),
            multi: true
        }
    ]
})
export class CodeEditorComponent implements OnInit, ControlValueAccessor {

    @Input()
    options: Partial<AceEditorOptions>;

    private editor: AceAjax.Editor;

    private originalContent: string;

    private onChange: (_: any) => {};

    private onTouch: () => {};

    constructor(private elementRef: ElementRef) {
    }

    ngOnInit() {
        // Instantiate an editor
        this.editor = ace.edit(this.elementRef.nativeElement);
        this.editor.setOptions(Object.assign({
            theme: "ace/theme/monokai",
            mode: "ace/mode/text",
            enableBasicAutocompletion: true,
        } as Partial<AceEditorOptions>, this.options));

        // Hack for disabling the warning message about a deprecated method
        this.editor.$blockScrolling = Infinity;


    }

    ngOnDestroy() {
        this.editor.destroy();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (!changes["options"].isFirstChange()) {
            this.editor.setOptions(changes["options"]);
        }
    }

    writeValue(content: string): void {
        if (content === undefined || content === null) {
            return;
        }

        if (!this.originalContent) {
            this.originalContent = content;
        }

        if (content !== this.editor.getValue()) {
            // Using this.editor.setValue selects the whole document, session doesn't
            this.editor.session.setValue(content);
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
        this.editor.on("change", (change) => {
            this.onChange(this.editor.getValue())
        })
    }

    registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.editor.setReadOnly(isDisabled);
    }

    getEditorInstance(): AceAjax.Editor {
        return this.editor;
    }

}
