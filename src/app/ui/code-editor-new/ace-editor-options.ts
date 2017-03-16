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
    theme?: string; // path to a theme e.g "ace/theme/textmate"

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
