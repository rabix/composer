import {Component, Input, OnInit, Injector} from "@angular/core";
import {ActionButtonComponent} from "./action-button.component";
import {ModalComponent} from "../../modal/modal.component";
import {NewFileModalComponent} from "../new-file-modal.component";
import {FileApi} from "../../../services/api/file.api";

@Component({
    selector: 'new-file-button',
    template: `
        <action-button class="nav-link" 
                        title="New File" 
                        buttonType="{{ buttonType }}" 
                        iconClass="fa fa-file fa-lg"
                        (click)="openModal()">
        </action-button>
    `,
    providers: [ModalComponent],
    directives: [ActionButtonComponent]
})
export class NewFileButtonComponent implements OnInit {
    @Input() buttonType: string;
             fileTypes: any[];
             selectedType: any;
             loading: boolean;

    constructor(private modal: ModalComponent, private fileApi: FileApi, private injector: Injector) {
        
    }

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

        this.modal.modalComponent = NewFileModalComponent;

        // so the modalComponent can resolve dependencies in the same tree
        // as the component initiating it
        this.modal.injector = this.injector;

        this.modal.data = {
            fileName: '',
            fileTypes: this.fileTypes,
            selectedType: this.selectedType,
            isCreatingFile: false
        };

        this.modal.cancel = function() {
            this.cref.destroy();
            // By rejecting, the show must catch the error. So by resolving,
            // it can be ignored silently in case the result is unimportant.
            this.result.resolve();
        };

        this.modal.confirm = function(data) {
            this.cref.destroy();
            this.result.resolve(data);
        };
    }
}
