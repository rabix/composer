import {enableProdMode} from "@angular/core";
import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";

import {AppModule} from "./app/app.module";
import {environment} from "./environments/environment";
import {ElectronSystemService} from "./app/platform-providers/electron-system.service";
import {SystemService} from "./app/platform-providers/system.service";

if (environment.production) {
    enableProdMode();
}


platformBrowserDynamic([{
    provide: SystemService,
    useClass: ElectronSystemService,
}]).bootstrapModule(AppModule);
