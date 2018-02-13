import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    forwardRef,
    Input,
    NgZone,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges
} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";

import * as ace from "brace";

import "brace/ext/language_tools";
import "brace/ext/searchbox";

import "brace/mode/text";
import "brace/mode/c_cpp";
import "brace/mode/html";
import "brace/mode/apache_conf";
import "brace/mode/java";
import "brace/mode/javascript";
import "brace/mode/json";
import "brace/mode/markdown";
import "brace/mode/python";
import "brace/mode/r";
import "brace/mode/scss";
import "brace/mode/sh";
import "brace/mode/typescript";
import "brace/mode/xml";
import "brace/mode/yaml";

import "brace/theme/chrome";
import "brace/theme/idle_fingers";


import {AceEditorOptions} from "./ace-editor-options";
import {getModeForPath} from "./modelist";

@Component({
    selector: "ct-code-editor",
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
export class CodeEditorComponent implements OnInit, ControlValueAccessor, OnDestroy, OnChanges {

    @Input()
    options: Partial<AceEditorOptions> = {};

    @Input()
    filePath?: string;

    editor: ace.Editor;

    private originalContent: string;

    private onChange: (_: any) => {};

    private onTouch: () => {};

    constructor(private elementRef: ElementRef, private zone: NgZone) {
    }

    ngOnInit() {

        // To avoid unnecessary change detection cycle because of mouse and other events that occur on Ace editor
        this.zone.runOutsideAngular(() => {
            this.editor = ace.edit(this.elementRef.nativeElement);
        });

        const mode           = this.options.mode;
        const determinedMode = this.determineMode(mode);

        delete this.options.mode;

        this.editor.setOptions(Object.assign({
            theme: "ace/theme/idle_fingers",
            enableBasicAutocompletion: true,
        } as Partial<AceEditorOptions>, this.options));

        this.editor.session.setMode(determinedMode);

        // Hack for disabling the warning message about a deprecated method
        this.editor.$blockScrolling = Infinity;

        // Automatically assign a mode if file path is given
        if (!mode && this.filePath) {
            const m = getModeForPath(this.filePath);
            this.editor.session.setMode(m.mode);
        }
    }


    ngOnChanges(changes: SimpleChanges) {
        if (changes["options"] && !changes["options"].isFirstChange()) {
            const mode = this.determineMode(this.options ? this.options.mode : undefined);

            this.editor.setOptions({...this.options});
            this.editor.session.setMode(mode);
        }
    }

    writeValue(content: string): void {
        if (content === undefined || content === null) {
            return;
        }

        if (typeof content !== "string") {
            throw new Error(`Expected content to be typeof "string", instead got "${typeof content}"`);
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
            this.onChange(this.editor.getValue());
        });
    }

    registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }

    setFocus(): void {
        this.editor.focus();
    }

    setDisabledState(isDisabled: boolean): void {
        this.editor.setReadOnly(isDisabled);
    }

    getEditorInstance(): ace.Editor {
        return this.editor;
    }

    ngOnDestroy() {
        this.editor.destroy();
    }

    private ensureModePrefix(mode?: string): string | undefined {
        const modePrefix = "ace/mode/";

        if (!mode) {
            return;
        }

        if (mode.startsWith(modePrefix)) {
            return mode;
        }

        return modePrefix + mode;

    }

    private determineMode(desiredMode: string | undefined): string {
        if (!desiredMode) {
            return "ace/mode/text";
        }

        return this.ensureModePrefix(desiredMode);
    }

}
