import {Component, OnInit, ElementRef, Input} from "@angular/core";
import {FileRegistry} from "../../services/file-registry.service";
import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {FileModel} from "../../store/models/fs.models";

require('./gui-editor.component.scss');

@Component({
    selector: 'gui-editor',
    directives: [BlockLoaderComponent],
    template: `
                <div id="guiEditorContainer">
                    <form>
                      <fieldset class="form-group">
                        <label for="baseCommand">Base Command</label>
                        <input type="text" class="form-control" id="baseCommand" placeholder="enter value">
                      </fieldset>
                    </form>
                </div>`,
})
export class GuiEditorComponent implements OnInit {
    @Input() file: FileModel;

    constructor(private fileRegistry: FileRegistry) {}

    ngOnInit(): any {

    }

}
