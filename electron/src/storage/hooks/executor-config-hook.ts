import {findDefaultExecutorJar} from "../../rabix-executor/rabix-executor";
import {DataRepository} from "../data-repository";
import {RepositoryHook} from "./repository-hook";

export class ExecutorDefaultPathLoader implements RepositoryHook {

    afterLoad(repository: DataRepository) {
        const executorConfig = repository.local.executorConfig;

        // If executor path is already set, we should do nothing
        if (executorConfig.choice === "custom") {
            return;
        }
        repository.updateLocal({
            executorConfig: {
                choice: "bundled",
                path: findDefaultExecutorJar(),
                outDir: executorConfig.outDir
            }
        });
    }
}
