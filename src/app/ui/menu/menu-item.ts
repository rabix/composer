import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";

interface MenuItemUpdates {
    click?: Subject<MenuItem> | Function;
    isEnabled?: Observable<boolean> | boolean;
}

export class MenuItem {
    isDisabled: any;
    readonly name: string;
    readonly updates: MenuItemUpdates;
    readonly children: MenuItem[];

    constructor(name: string,
                streams?: MenuItemUpdates,
                children?: MenuItem[]) {

        this.name     = name;
        this.children = children || [];

        this.updates = Object.assign({
            click: new Subject(),
            isEnabled: new BehaviorSubject(true)
        }, streams || {});
    }
}
