import {Component} from "angular2/core";
import {GLayoutDirective} from "./glayout.directive";
@Component({
    selector: "workspace",
    directives: [GLayoutDirective],
    template: `<section glayout></section>`,
    styles: ["[glayout] { width: 100%; height: 100%}"]
})
export class WorkspaceLayoutComponent {

}
