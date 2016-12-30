import {AppModule} from "./app.module";
import {forwardRef} from "@angular/core";
import {IpcService} from "./app/services/ipc.service";
import {FILE_RESOLVERS} from "./app/core/file-registry/types";
import {SystemService} from "./app/platform-providers/system.service";
import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import {PlatformAPI} from "./app/services/api/platforms/platform-api.service";
import {LocalDataSourceService} from "./app/sources/local/local.source.service";
import {ElectronSystemService} from "./app/platform-providers/electron-system.service";
import {SBPlatformDataSourceService} from "./app/sources/sbg/sb-platform.source.service";

platformBrowserDynamic([
    {provide: SystemService, useClass: ElectronSystemService},
    {
        provide: FILE_RESOLVERS,
        useFactory: () => new SBPlatformDataSourceService(forwardRef(() => PlatformAPI)()),
        multi: true
    },
    {
        provide: FILE_RESOLVERS,
        useFactory: () => new LocalDataSourceService(forwardRef(() => IpcService)()),
        multi: true
    }
]).bootstrapModule(AppModule).catch(err => console.error(err));
