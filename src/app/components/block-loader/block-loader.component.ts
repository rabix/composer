import {Component} from "@angular/core";
require("./block-loader.component.scss");

@Component({
    selector: "block-loader",
    template: `
        <div class="vertically-aligned-cell">
            <i class="fa fa-cog fa-spin fa-2x"></i>
            <div>Loading...</div>
         </div>
    `
})
export class BlockLoaderComponent {

}
