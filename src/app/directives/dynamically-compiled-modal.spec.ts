import {it, inject, describe, beforeEachProviders, injectAsync} from "@angular/core/testing";
import {TestComponentBuilder, ComponentFixture} from "@angular/compiler/testing"
//import {ModalBuilder, ModalFunctionsInterface, DynamicDataInterface} from "./modal.builder";
//import {InjectableModalInterface} from "../interfaces/injectable-modal.interface";
import {NewFileModalComponent} from "../components/common/new-file-modal.component";
import {DynamicallyCompiledModalDirective} from "../directives/dynamically-compiled-modal.directive";

import {
    NgStyle,
    FORM_DIRECTIVES } from '@angular/common';

import {Component, ComponentResolver, ComponentFactory, Input} from '@angular/core';

describe("DynamicallyCompiledModalDirective", () => {
    beforeEachProviders(() => [DynamicallyCompiledModalDirective]);

    describe("ngOnInit", () => {

        it("should return a component inside the container template",
            injectAsync([TestComponentBuilder, ComponentResolver],
                (tcb: TestComponentBuilder, resolver: ComponentResolver) => {

                    let fileTypes = [{
                        id: '.json',
                        name: 'JSON'
                    }, {
                        id: '.yaml',
                        name: 'YAML'
                    }, {
                        id: '.js',
                        name: 'JavaScript'
                    }];

                   /* let injectableModal = {
                        selector: 'modal-component',
                        containerTemplate: `<div class="containerTemplate"><template #dynamicContentPlaceHolder></template></div>`,
                        viewContainerRefName: 'dynamicContentPlaceHolder',
                        modalComponent: NewFileModalComponent,
                        data: {
                            fileName: 'test',
                            fileTypes: fileTypes,
                            selectedType: fileTypes[0]
                        }
                    };*/

                    let modalFunctions = {
                        cancel: function () {
                        },
                        confirm: function () {
                        }
                    };

                    let data = {
                        fileName: 'test',
                            fileTypes: fileTypes,
                            selectedType: fileTypes[0]
                    };

                    resolver.resolveComponent(NewFileModalComponent)
                        .then((factory:ComponentFactory) => {
                            let componentFactory = factory;

                            @Component({
                                selector: 'container',
                                template: `
                                    <div class="containerTemplate">
                                        <dynamic-modal [dynamicModal]="factory"
                                                  [data]="data"
                                                  [functions]="functions">
                                        </dynamic-modal>
                                    </div>`,
                                directives: [DynamicallyCompiledModalDirective, NewFileModalComponent]
                            })
                            class Container {
                                @Input() public factory: any;
                                @Input() public data: any;
                                @Input() public functions: any;
                            }

                           return tcb.createAsync(Container)
                                .then((fixture) => {

                                    fixture.componentInstance.factory = componentFactory;
                                    fixture.componentInstance.data = data;
                                    fixture.componentInstance.functions = modalFunctions;

                                    fixture.detectChanges();

                                    let element = fixture.nativeElement;
                                    let containerElement = element.querySelector(".containerTemplate");

                                    expect(element.querySelectorAll('option').length).toBe(3);
                                }).catch((e) => {
                                    console.log('Error ' + e);
                            });
                        });
            })); /* Test case */

    });

});
