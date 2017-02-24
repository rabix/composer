/*
 * Custom Type Definitions
 * When including 3rd party modules you also need to include the type definition for the module
 * if they don't provide one within the module. You can try to install it with typings

 typings install node --save

 * If you can't find the type definition in the registry we can make an ambient definition in
 * this file for now. For example

 declare module "my-module" {
 export function doesSomething(value: string): string;
 }

 *
 * If you're prototying and you will fix the types later you can also declare it as type any
 *

 declare var assert: any;

 *
 * If you're importing a module that uses Node.js modules which are CommonJS you need to import as
 *

 import * as _ from 'lodash'

 * You can include your type definitions in this file until you create one for the typings registry
 * see https://github.com/typings/registry
 *
 */

declare module "*"


interface Window {
    require: NodeRequire
}

// Extra variables that live on Global that will be replaced by webpack DefinePlugin
declare let ENV: string;

declare namespace Reflect {
    function decorate(decorators: ClassDecorator[], target: Function): Function;
    function decorate(decorators: (PropertyDecorator | MethodDecorator)[],
                      target: Object,
                      targetKey: string | symbol,
                      descriptor?: PropertyDescriptor): PropertyDescriptor;

    function metadata(metadataKey: any, metadataValue: any): {
        (target: Function): void;
        (target: Object, propertyKey: string | symbol): void;
    };

    function defineMetadata(metadataKey: any, metadataValue: any, target: Object): void;
    function defineMetadata(metadataKey: any,
                            metadataValue: any,
                            target: Object,
                            targetKey: string | symbol): void;

    function getMetadata(metadataKey: any, target: Object): any;
    function getMetadata(metadataKey: any, target: Object, targetKey: string | symbol): any;

    function getOwnMetadata(metadataKey: any, target: Object): any;
    function getOwnMetadata(metadataKey: any, target: Object, targetKey: string | symbol): any;
}
