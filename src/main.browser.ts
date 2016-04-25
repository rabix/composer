/// <reference path="./../typings/browser.d.ts"/>

import {bootstrap} from "angular2/platform/browser";
import {MainComponent} from "./app/main/main.component";

export function main(): Promise<any> {
    return bootstrap(MainComponent).catch(err => console.error(err));
}

/*
 * Hot Module Reload
 * experimental version by @gdi2290
 */
if ('development' === ENV && HMR === true) {
    // activate hot module reload
    let ngHmr = require('angular2-hmr');
    ngHmr.hotModuleReplacement(main, module);
} else {
    // bootstrap when documetn is ready
    document.addEventListener('DOMContentLoaded', () => main());
}
