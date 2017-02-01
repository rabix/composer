import {Component} from "@angular/core";

require("./block-loader.component.scss");

@Component({
    selector: "block-loader",
    template: `
        <div class="block-loader">
            <div class="vertically-aligned-cell">
                <i class="fa fa-cog fa-spin fa-3x"></i>
                <p>Loading...</p>
             </div>
        </div>
        
    `
})
export class BlockLoaderComponent {

}
