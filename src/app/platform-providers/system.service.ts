export abstract class SystemService {
    public abstract openLink(url: string, event?: MouseEvent): void;

    public abstract boot(): void;
}
