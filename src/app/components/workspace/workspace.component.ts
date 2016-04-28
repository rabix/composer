import {Component} from "angular2/core";
import {GLayoutDirective} from "./glayout.directive";
@Component({
    selector: "workspace",
    host: {"class": "component-workspace"},
    directives: [GLayoutDirective],
    template: `<section style="width: 100%; height: 100%;" glayout><section>`,
})
export class WorkspaceLayoutComponent {

}
