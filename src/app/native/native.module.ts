import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {ElectronProxyService} from "./proxy/electron-proxy.service";
import {NativeSystemService} from "./system/native-system.service";

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [],
    providers: [
        ElectronProxyService,
        NativeSystemService
    ]
})
export class NativeModule {
}
