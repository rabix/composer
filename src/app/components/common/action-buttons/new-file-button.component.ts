import {Component, Input, OnInit, Injector, ComponentResolver, ComponentFactory} from "@angular/core";
import {ActionButtonComponent} from "./action-button.component";
import {ModalComponent} from "../../modal/modal.component";
import {NewFileModalComponent} from "../new-file-modal.component";
import {ModalData} from "../../../models/modal.data.model";
import {DynamicComponentContext} from "../../runtime-compiler/dynamic-component-context";

@Component({
    selector: 'new-file-button',
    template: `
        <action-button class="nav-link" 
                        title="New File" 
                        iconClass="fa fa-file fa-lg"
                        (click)="openModal()">
        </action-button>
    `,
    providers: [ModalComponent],
    directives: [ActionButtonComponent]
})
export class NewFileButtonComponent implements OnInit {
    @Input() fileTypes: any[];

    constructor(private modal: ModalComponent, private injector: Injector, private resolver: ComponentResolver) { }
    /**
     * Opens new file modal
     */
    openModal(): void {
        // result should just be final result, like file to open
        this.modal.show();
    }

    ngOnInit() {
        this.initModal();
    }

    initModal() {
        this.resolver.resolveComponent(NewFileModalComponent)
            .then((factory:ComponentFactory<any>) => {
                let modalData = new ModalData({
                    functions: {
                        cancel: function() {
                            this.cref.destroy();
                            this.result.resolve();
                        },
                        confirm: function(data) {
                            this.cref.destroy();
                            this.result.resolve(data);
                        }
                    }
                });

                this.modal.injector = this.injector;
                this.modal.dynamicComponentContext = new DynamicComponentContext(factory, modalData);
            });
    }
}
