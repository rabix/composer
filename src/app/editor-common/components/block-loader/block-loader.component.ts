import {Component, ViewEncapsulation} from "@angular/core";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "block-loader",
    styleUrls: ["./block-loader.component.scss"],
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
