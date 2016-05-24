import {Component} from "@angular/core";

export interface DynamicDataInterface {
    data?: any;
    confirm: any;
    cancel: any;
}

export class CustomComponentBuilder{

    public CreateComponent(tmpl: string, injectDirectives: any[]): any {

        @Component({
            selector: 'dynamic-component',
            template: tmpl,
            directives: injectDirectives,
        })
        class CustomDynamicComponent implements DynamicDataInterface {
            public data: any;
            public confirm: any;
            public cancel: any;
        }

        return CustomDynamicComponent;
    }
}
