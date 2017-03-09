export abstract class SystemService {
    public abstract openLink(url: string): void;

    public abstract boot(): void;
}
