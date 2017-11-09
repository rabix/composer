import {RabixExecutor} from "../../rabix-executor/rabix-executor";
import {DataRepository} from "../data-repository";
import {RepositoryHook} from "./repository-hook";

export class Executor implements RepositoryHook {

    afterLoad(repository: DataRepository) {
        const executorConfig = repository.local.executorConfig;

        if (executorConfig.path) {
            return;
        }

        const rabix = new RabixExecutor();
        // If there is no executor path set, see if you can run just “rabix” as a process, then set that path

        rabix.getVersion((err, stdout) => {
            if (!err && stdout && stdout.startsWith("Rabix")) {
                repository.local.executorConfig.path = "rabix";
                repository.updateLocal({
                    executorConfig: repository.local.executorConfig
                });
            }
        });

    }
}
