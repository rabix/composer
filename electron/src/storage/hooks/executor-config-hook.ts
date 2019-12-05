import {findDefaultExecutorJar} from "../../rabix-executor/rabix-executor";
import {DataRepository} from "../data-repository";
import {RepositoryHook} from "./repository-hook";

export class ExecutorDefaultPathLoader implements RepositoryHook {

    afterLoad(repository: DataRepository) {
        const rabixExecutorConfig = repository.local.rabixExecutorConfig;

        // If executor path is already set, we should do nothing
        if (rabixExecutorConfig.choice === "custom") {
            return;
        }
        repository.updateLocal({
            rabixExecutorConfig: {
                choice: "bundled",
                path: findDefaultExecutorJar(),
                outDir: rabixExecutorConfig.outDir
            }
        });
    }
}
