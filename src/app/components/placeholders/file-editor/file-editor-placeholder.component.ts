import {Component} from "@angular/core";
require("./file-editor-placeholder.component.scss");

@Component({
    selector: "file-editor-placeholder",
    template: `
       <div class="full-size-table-display">
            <div class="vertically-aligned-cell">
                <i class="fa fa-5x fa-hand-o-left text-muted file-placeholder-hand"></i>
                <p class="placeholder-title">
                    Open a file by double-clicking on its name in the navigation menu.
                </p>
            </div>
       </div>
    `
})
export class FileEditorPlaceholderComponent {

}