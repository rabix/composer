import {ACE_MODES_MAP} from "../../components/code-editor/code-editor-modes-map";
import Editor = AceAjax.Editor;
import Document = AceAjax.Document;
import IEditSession = AceAjax.IEditSession;

export abstract class AbstractCodeEditorService {
    /** Holds an instance of the AceEditor */
    protected editor: Editor;

    /** Holds the AceEditor session object */
    protected session: IEditSession;

    protected document: Document;

    protected setText(text: string): void {
        this.document.setValue(text);
    }

    protected setTheme(theme: string): void {
        require('brace/theme/' + theme);
        this.editor.setTheme('ace/theme/' + theme);
    }

    protected setMode(mode: string): void {
        if (mode.charAt(0) === '.') {
            mode = ACE_MODES_MAP[mode] ? ACE_MODES_MAP[mode] : 'text';
        }

        require('brace/mode/' + mode);
        this.session.setMode('ace/mode/' + mode);
    }
}
