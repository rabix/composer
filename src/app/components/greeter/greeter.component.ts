import {Component} from "@angular/core";
import {NgFor} from "@angular/common";
import {GreeterListService} from "./greeter-list.service";
@Component({
    selector: 'greeter',
    directives: [NgFor],
    providers: [GreeterListService],
    styles: [`
        * {
            font-family: "Helvetica Neue", open-sans;
            color: white;
        }
        
        li {
            color: lightgray;
        }
        
        button {
            color: black;
        }
    `],
    template: `
        <p>This is a greeter!</p>
        <ul>
            <li *ngFor="let item of items | async">
            Item: <code>{{ item }}</code>
            
            <button class="btn btn-info" (click)="deleteItem(item)">delete</button>
            </li>
        </ul>
    `
})
export class GreeterComponent {

    private items;

    private listProvider: GreeterListService;

    constructor(listProvider: GreeterListService) {
        this.listProvider = listProvider;

        this.items = this.listProvider.getList();
        console.log("Creating a greeter");

    }

    ngOnDestroy() {
        console.log("Destroying a component", arguments);
    }

    deleteItem(item) {
        console.log('Click', item);
        this.listProvider.removeValue(item);
        console.log('list provider', this.listProvider.listStream.getValue());
    }
}
