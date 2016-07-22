export module Chap {
    export function noneOf(...args) {

        return {
            exists: args.findIndex(item => item !== undefined) === -1
        }

    }

    export function applyParams(params: Object, target: Object): void {
        Object.keys(params).forEach(key => {
            if (target.hasOwnProperty(key)) {
                target[key] = params[key];
            }
        })
    }

}
