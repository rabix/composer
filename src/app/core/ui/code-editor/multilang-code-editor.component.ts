import {Component, Output} from '@angular/core';
import {Subject, BehaviorSubject} from "rxjs";
import {ACE_MODES_MAP} from "../../../components/code-editor/code-editor-modes-map";

@Component({
    selector: 'ct-multilang-code-editor',
    template: `
    <div class="p-0 flex-row-container modal-large">
        <div class="form-inline modal-options">
            <div class="form-group">
                <label>Syntax highlighting: </label>
                <select class="form-control" 
                        (change)="language.next($event.target.value.toLowerCase())">
                    <option *ngFor="let lang of languages" 
                            [selected]="lang.toLowerCase() === (language | async)">
                            {{ lang }}
                    </option>
                </select>            
            </div>
        </div>
        
        <div class="main-row">
            <ct-code-editor-x [(content)]="content" [language]="language" [options]="{
                'theme': 'ace/theme/monokai',
                'wrap': true
            }"></ct-code-editor-x>
        </div>
        
        <div class="modal-footer">
            <button (click)="action.next('close')" class="btn btn-secondary btn-sm" type="button">Cancel</button>
            <button (click)="action.next('save')" class="btn btn-primary btn-sm" type="button">Save</button>
        </div>
    </div>
`
})
export class MultilangCodeEditorComponent {
    @Output()
    public action = new Subject<"close" | "save">();

    public content = new BehaviorSubject<string>("");

    public language = new BehaviorSubject<string>("text");

    private languages = Object.keys(ACE_MODES_MAP)
        .map(key => ACE_MODES_MAP[key])
        .reduce((prev, curr) => {
            curr = curr.toUpperCase();

            if (prev.indexOf(curr) === -1) {
                return prev.concat(curr);
            }
            return prev;
        }, [])
        .filter(key => key !== "C_CPP") // kind of a hack, showing C++ and C is prettier than C_CPP
        .concat(["C", "C++"])
        .sort();
}