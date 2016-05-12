/*
 * Providers provided by Angular
 */
import {bootstrap} from "@angular/platform-browser-dynamic";
import {HTTP_PROVIDERS} from "@angular/http";
/*
 * Platform and Environment
 * our providers/directives/pipes
 */
import {MainComponent} from "./app/main/main.component";

export function main(): Promise<any> {
    return bootstrap(MainComponent, [HTTP_PROVIDERS]).catch(err => console.error(err));
}

if ('development' === ENV && HMR === true) {
    // activate hot module reload
    let ngHmr = require('angular2-hmr');
    ngHmr.hotModuleReplacement(main, module);
} else {
    // bootstrap when documetn is ready
    document.addEventListener('DOMContentLoaded', () => main());
}
