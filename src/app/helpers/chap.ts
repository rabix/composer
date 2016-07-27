import {Subject} from "rxjs";
export module Chap {
    export function noneOf(...args) {

        return {
            exists: args.findIndex(item => item !== undefined) === -1
        }

    }

    export function applyParams(params: Object, target: Object): void {
        Object.keys(params).forEach(key => {
            if (target.hasOwnProperty(key)) {
                if ((target[key] instanceof Subject) && !(params[key] instanceof Subject)) {
                    target[key].next(params[key]);
                } else {
                    target[key] = params[key];
                }
            }
        })
    }

}
