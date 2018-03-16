export abstract class SystemService {
    abstract openLink(url: string, event?: MouseEvent): void;

    abstract boot(): void;
}
