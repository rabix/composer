import {Component, Input} from "@angular/core";

@Component({
    selector: "ct-clt-editor-list-entry",
    host: {
        "class": "gui-section-list-item clickable"
    },
    template: `
        
        <ng-content select=".ct-items"></ng-content> 
        
       
        
    `
})
export class ListEntryComponent {

    @Input()
    public fields = [];


    
    ngOnInit() {

    }
}