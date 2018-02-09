import {inject, TestBed} from "@angular/core/testing";
import {Observable} from "rxjs/Observable";
import {LocalRepositoryService} from "../repository/local-repository.service";
import {PlatformRepositoryService} from "../repository/platform-repository.service";
import {IpcService} from "../services/ipc.service";

import {ExecutorService} from "./executor.service";

describe("ExecutorService2", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ExecutorService,
                {
                    provide: IpcService,
                    useValue: {
                        request: () => void 0
                    }
                },
                {
                    provide: LocalRepositoryService,
                    useValue: {
                        getExecutorConfig: () => Observable.of({
                            path: "/usr/local/bin/rabix"
                        })
                    }
                },
                {
                    provide: PlatformRepositoryService,
                    useValue: {}
                }
            ]
        });
    });

    it("should be created", inject([ExecutorService], (service: ExecutorService) => {
        expect(service).toBeTruthy();
    }));
});
