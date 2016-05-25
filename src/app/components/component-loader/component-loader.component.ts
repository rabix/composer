import {Component} from "@angular/core";
require("./component-loader.component.scss");

@Component({
    selector: "component-loader",
    template: `
        <div>
            <i class="fa fa-cog fa-spin fa-2x"></i>
            <div>Loading</div>
         </div>
    `
})
export class ComponentLoaderComponent {

}
