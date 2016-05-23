import {Component, Input} from "@angular/core";

@Component({
    selector: "file-tree:file",
    template: `
        <div>File: {{ model.name }}</div>
    `
})
export class FileNodeComponent {
    name: string;

    @Input() model;

    ngOnInit(){
        console.log("File got a model", this.model);
        
    }
}
