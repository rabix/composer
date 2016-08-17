/*
 * Providers provided by Angular
 */
import {bootstrap} from "@angular/platform-browser-dynamic";
import {HTTP_PROVIDERS} from "@angular/http";
import {MainComponent} from "./app/components/main/main.component";
import {disableDeprecatedForms, provideForms} from "@angular/forms";
import {COMMON_PIPES} from "@angular/common";
/*
 * Platform and Environment
 * our providers/directives/pipes
 */

export function main(): Promise<any> {
    return bootstrap(MainComponent, [
        COMMON_PIPES,
        HTTP_PROVIDERS,
        disableDeprecatedForms(),
        provideForms()
    ]).catch(err => console.error(err));
}

if ('development' === ENV && HMR === true) {
    // activate hot module reload
    let ngHmr = require('angular2-hmr');
    ngHmr.hotModuleReplacement(main, module);
} else {
    // bootstrap when documetn is ready
    document.addEventListener('DOMContentLoaded', () => main());
}
