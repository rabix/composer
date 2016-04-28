import {Component} from "angular2/core";
import {NgFor} from "angular2/common";
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
        <p>Title!</p>
        <ul>
            <li *ngFor="#item of items | async">
            Item: <code>{{ item }}</code>
            
            <button (click)="deleteItem(item)">delete</button>
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
    }

    deleteItem(item) {
        this.listProvider.removeValue(item);
    }
}
