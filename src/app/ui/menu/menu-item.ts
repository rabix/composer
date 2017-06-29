import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

interface MenuItemUpdates {
    click?: Subject<MenuItem> | Function;
    isEnabled?: Observable<boolean> | boolean;
}

export class MenuItem {
    public isDisabled: any;
    public readonly name: string;
    public readonly updates: MenuItemUpdates;
    public readonly children: MenuItem[];

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
