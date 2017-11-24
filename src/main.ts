import {enableProdMode} from "@angular/core";
import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";

import {AppModule} from "./app/app.module";
import {ElectronSystemService} from "./app/platform-providers/electron-system.service";
import {BrowserSystemService} from "./app/platform-providers/browser-system.service";
import {SystemService} from "./app/platform-providers/system.service";
import {environment} from "./environments/environment";

if (environment.production) {
    enableProdMode();
}


platformBrowserDynamic([{
    provide: SystemService,
    useClass: (environment.browser) ? BrowserSystemService : ElectronSystemService,
    deps: []
}]).bootstrapModule(AppModule);
