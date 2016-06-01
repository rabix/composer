/*
import {it, inject, describe, beforeEachProviders, injectAsync} from "@angular/core/testing";
import {TestComponentBuilder, ComponentFixture} from "@angular/compiler/testing"
import {NewFileModalComponent} from "../components/common/new-file-modal.component";
import {DynamicallyCompiledComponentDirective} from "../directives/dynamically-compiled-component.directive";

import {
    NgStyle,
    FORM_DIRECTIVES } from '@angular/common';

import {XHR} from "@angular/compiler"
import {Component, ComponentResolver, ComponentFactory, Input, ViewMetadata} from '@angular/core';
import {BlockLoaderComponent} from "../components/block-loader/block-loader.component";

describe("DynamicallyCompiledModalDirective", () => {
    beforeEachProviders(() => [DynamicallyCompiledComponentDirective]);

    describe("ngOnInit", () => {

        it("should return a component inside the container template",
            injectAsync([TestComponentBuilder, ComponentResolver],
                (tcb: TestComponentBuilder, resolver: ComponentResolver, xhr: XHR) => {

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

                      //xhr.get('app/components/common/new-file-modal.component.html').then((t) => {
                      //  let template = t;

                        tcb.overrideView(NewFileModalComponent, new ViewMetadata({
                                directives: [NgStyle, BlockLoaderComponent, FORM_DIRECTIVES],
                                templateUrl: './../app/components/common/new-file-modal.component.html'
                            }))
                            .createAsync(NewFileModalComponent)
                            .then((newFileModalComponentFixture) => {

                                resolver.resolveComponent(newFileModalComponentFixture)
                                    .then((factory:ComponentFactory) => {
                                        let componentFactory = factory;

                                        /!*
                                         *
                                         *  <dynamic-modal [dynamicModal]="factory"
                                         [data]="data"
                                         [functions]="functions">
                                         </dynamic-modal>
                                         * *!/
                                        @Component({
                                            selector: 'container',
                                            template: `
                                            <div class="containerTemplate">
                                                <template [dynamicallyCompiled]="factory" 
                                                  [model]="=data"
                                                  [functions]="functions">
                                                 </template>
                                            </div>
                                    `,
                                            directives: [DynamicallyCompiledModalDirective, NewFileModalComponent]
                                        })
                                        class Container {
                                            @Input() public factory: any;
                                            @Input() public data: any;
                                            @Input() public functions: any;
                                        }

                                        return tcb
                                            .createAsync(Container)
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

                            }).catch((e) => {
                                console.log('Error ' + e);
                            });
                 //   });
            })); /!* Test case *!/

    });

});
*/
