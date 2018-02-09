import {LocalRepositoryService} from "../repository/local-repository.service";
import {CredentialsRegistry} from "../auth/credentials-registry";
import {AuthCredentials} from "../auth/model/auth-credentials";

export const credentialsRegistryFactory = (localRepository: LocalRepositoryService) => {
    return {
        getActiveCredentials() {
            return localRepository.getActiveCredentials();
        },
        getCredentials() {
            return localRepository.getCredentials();
        },
        setActiveCredentials(credentials: AuthCredentials) {
            return localRepository.setActiveCredentials(credentials);
        },
        setCredentials(credentials: AuthCredentials[]) {
            return localRepository.setCredentials(credentials);
        }
    } as CredentialsRegistry;
};
