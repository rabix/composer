import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import {AppModule} from "./app.module";
import {SystemService} from "./app/platform-providers/system.service";
import {ElectronSystemService} from "./app/platform-providers/electron-system.service";

platformBrowserDynamic([
    {provide: SystemService, useClass: ElectronSystemService}
]).bootstrapModule(AppModule).catch(err => console.error(err));