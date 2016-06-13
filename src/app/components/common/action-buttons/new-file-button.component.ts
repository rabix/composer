import {Component, Input, OnInit, Injector, ComponentResolver, ComponentFactory} from "@angular/core";
import {ActionButtonComponent} from "./action-button.component";
import {ModalComponent} from "../../modal/modal.component";
import {NewFileModalComponent} from "../new-file-modal.component";

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
                this.modal.factory = factory;
            });

        // so the modalComponent can resolve dependencies in the same tree
        // as the component initiating it
        this.modal.injector = this.injector;

        this.modal.data = {};

        this.modal.functions = {
            cancel: function() {
                this.cref.destroy();
                // By rejecting, the show must catch the error. So by resolving,
                // it can be ignored silently in case the result is unimportant.
                this.result.resolve();
            },
            confirm: function(data) {
                this.cref.destroy();
                this.result.resolve(data);
            }
        }
    }
}
