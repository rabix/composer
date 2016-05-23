import {Component, Input} from "@angular/core";

@Component({
    selector: "file-tree:directory",
    template: `
        <div>Dir: {{ model.name }}</div>
    `
})
export class DirectoryNodeComponent {
    name: string;

    @Input() model;

    ngOnInit() {
        console.log("Directory got a model", this.model);
    }
}
