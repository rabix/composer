import { Component, ComponentRef, DynamicComponentLoader, ApplicationRef, Injectable, ViewContainerRef } from '@angular/core';
import { NgStyle } from '@angular/common';
import { PromiseWrapper } from '@angular/common/src/facade/async';

/**
 * Usage: https://github.com/czeckd/angular2-simple-modal
 * */
export enum ModalType {
    Default,
    Info,
    Warning,
    Critical
}

@Injectable()
export class ModalComponent {

    title:string = '';
    message:string = '';
    type:ModalType = ModalType.Default;
    blocking:boolean = true;
    confirmBtn:string = null;
    cancelBtn:string = 'OK';

    selectLabel:string = '';
    selectOptions:any[];
    selectedValue:any;

    width:number = 250;
    height:number = 150;

    template:string = `	
    <div class="modal-dialog" role="document">
    <div class="modal-content">
    
           <div class="modal-header">
            <h2  *ngIf="title" class="modal-title" [innerHTML]="title"></h2>
           </div>
          
            <div class="modal-body">
                <div class="modal-message" [innerHTML]="message"></div>
                
                <!--
                TODO: !!!This is a temporary solution until I figure out how to pass data here
                -->
                
                <fieldset *ngIf="selectOptions.length > 0" class="form-group">
                <label for="create_file_action">{{selectLabel}}</label>
                    <select class="form-control" id="create_file_action" [(ngModel)]="selectedValue">
                        <option *ngFor="let value of selectOptions" [value]="value">{{value.name}}</option>
                    </select>
                </fieldset>
            </div>
            
            <div class="modal-footer">
                <button class="btn btn-default" *ngIf="cancelBtn" (click)="cancel()" >{{cancelBtn}}</button>
                <button class="btn btn-primary" *ngIf="confirmBtn" (click)="confirm()">{{confirmBtn}}</button>
            </div>
    
    </div>
    </div>
		
		`;

    constructor(private dcl:DynamicComponentLoader, private app:ApplicationRef) {
    }

    toComponent() : Function {
        let title:string = this.title;
        let message:string = this.message;
        let width:string = this.width + 'px';
        let height:string = this.height + 'px';
        let confirmBtn:string = this.confirmBtn;
        let cancelBtn:string = this.cancelBtn;
        let icon:string = null;

        let selectLabel:string = this.selectLabel;
        let selectOptions:any[] = this.selectOptions;
        let selectedValue:any = this.selectedValue;

        let template:string;

        if (this.blocking) {
            template = `<div class="modal-background">` +
                `<div class="modal" [ngStyle]="{'width':'` + width + `', 'height':'` + height + `'}">` +
                this.template + `</div></div>`;
        } else {
            template = `<div class="modal-background" (click)="cancel()">` +
                `<div class="modal" (click)="$event.stopPropagation()" [ngStyle]="{'width':'` + width + `', 'height':'` + height + `'}">` +
                this.template + `</div></div>`;;
        }

        switch (this.type) {
            case ModalType.Info:
                icon = 'images/info-circle.svg';
                break;
            case ModalType.Warning:
                icon = 'images/warning.svg';
                break;
            case ModalType.Critical:
                icon = 'images/exclamation-circle.svg';
                break;
            default:
                break;
        }

        // Note: Do NOT use styleUrls, because they'll keep getting added to the DOM.
        @Component({
            selector: 'modal',
            directives: [ NgStyle ],
            template: template
        })
        class Modal {
            cref:ComponentRef<Modal> = null;

            /* tslint:disable:no-unused-variable */
            private title:string = title;
            private message:string = message;
            private icon:string = icon;

            private selectLabel:string = selectLabel;
            private selectOptions:any[] = selectOptions;
            private selectedValue:any = selectedValue;

            /* tslint:enable:no-unused-variable */
            private confirmBtn:string = confirmBtn;
            private cancelBtn:string = cancelBtn;
            private result:any;

            confirm() {
                this.cref.destroy();
                this.result.resolve(this.confirmBtn);
            }

            cancel() {
                this.cref.destroy();

                // By rejecting, the show must catch the error. So by resolving,
                // it can be ignored silently in case the result is unimportant.
                // this.result.reject(this.cancelBtn);
                this.result.resolve(this.cancelBtn);
            }
        }
        return Modal;
    }

    show() : Promise<any> {
        // Top level hack
        let vcr:ViewContainerRef = this.app['_rootComponents'][0]['_hostElement'].vcRef;

        // Set up the promise to return.
        let pw:any = PromiseWrapper.completer();

        this.dcl.loadNextToLocation(this.toComponent(), vcr).then( (cref) => {
            // Assign the cref to the newly created modal so it can self-destruct correctly.
            cref.instance.cref = cref;

            // Assign the promise to resolve.
            cref.instance.result = pw;
        });

        return pw.promise;
    }
}
