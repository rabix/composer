import {ACE_MODES_MAP} from "../code-editor/code-editor-modes-map";
import Editor = AceAjax.Editor;
import Document = AceAjax.Document;
import IEditSession = AceAjax.IEditSession;

// allows search within document
require('brace/ext/searchbox');

export abstract class AbstractCodeEditor {
    /** Holds an instance of the AceEditor */
    protected editor: Editor;

    /** Holds the AceEditor session object */
    protected session: IEditSession;

    protected document: Document;

    public setText(text: string): void {
        this.document.setValue(text);
    }

    protected setTheme(theme: string): void {
        require('brace/theme/' + theme);
        this.editor.setTheme('ace/theme/' + theme);
    }

    protected setMode(mode: string): void {
        mode = ACE_MODES_MAP[mode] ? ACE_MODES_MAP[mode] : 'text';

        require('brace/mode/' + mode);
        this.session.setMode('ace/mode/' + mode);
    }
}
