import {Component, Input, OnInit} from '@angular/core';
import * as _ from 'lodash';

import {ActionButtonComponent} from "./action-button.component";
import {ModalComponent, ModalType} from "../../modal/modal.component";
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

    constructor(private modal: ModalComponent, private fileApi: FileApi) {
        this.fileTypes = [{
            id: '.json',
            name: 'JSON'
        }, {
            id: '.yaml',
            name: 'YAML'
        }, {
            id: '.js',
            name: 'JavaScript'
        }];

        this.selectedType = this.fileTypes[0];

        this.loading = true;
    }

    /**
     * Opens new file modal
     */
    openModal(): void {
        this.modal.show().then((result) => {
            // turn on loading
            if (!result) {
                return;
            }

            let fileName = result.fileName;
            let ext = result.selectedType.id;

            // IF: file already has an extension
            if ('.' + _.last(fileName.split('.')) === ext) {
                // remove extension
                fileName = fileName.split('.').slice(0, -1).join('.');
            }

            let filePath = fileName + ext;

            // create file
            this.fileApi.createFile(filePath).subscribe((next) => {
                console.log(next);

                // IF: file exists
                if (next.statusCode === 403) {
                    // prompt user that file already exists
                    console.log('File already exists');
                } else {
                    console.log('something else went wrong...?');
                }

            });

        });
    }

    ngOnInit() {
        this.initModal();
    }

    initModal() {

        this.modal.type = ModalType.NewFile;
        this.modal.width = 350;
        this.modal.height = 300;

        this.modal.data = {
            fileName: '',
            fileTypes: this.fileTypes,
            selectedType: this.selectedType,
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
