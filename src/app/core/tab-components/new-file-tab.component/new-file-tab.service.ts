import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {RecentAppTab} from "../../../../../electron/src/storage/types/recent-app-tab";
import {LocalRepositoryService} from "../../../repository/local-repository.service";
import {PlatformRepositoryService} from "../../../repository/platform-repository.service";
import {combineLatest} from "rxjs/observable/combineLatest";
import {startWith, map} from "rxjs/operators";

@Injectable()
export class NewFileTabService {

    constructor(private localRepository: LocalRepositoryService,
                private platformRepository: PlatformRepositoryService) {
    }

    /**
     * Creates an observable list of recently opened apps
     * @param {number} max
     * @returns {Observable<any[]>}
     */
    getRecentApps(max = 20): Observable<RecentAppTab[]> {
        return combineLatest(
            this.localRepository.getRecentApps().pipe(
                startWith([])
            ),
            this.platformRepository.getRecentApps().pipe(
                map(apps => apps || []),
                startWith([])
            ), (localApps, platformApps) => [...localApps, ...platformApps].sort((a, b) => b.time - a.time).slice(0, max)
        );
    }
}
