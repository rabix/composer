import {Component} from "@angular/core";

// css does not need to be included here
// main.scss already loads it for the startup spinner
// require("./block-loader.component.scss");

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
