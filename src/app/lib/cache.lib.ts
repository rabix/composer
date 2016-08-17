import {ReplaySubject, BehaviorSubject, Observable} from "rxjs";
interface CacheComparator<T> {
    (a: T, b: T): boolean
}
export class HashCache<T> {
    private cache: BehaviorSubject<{[id: string]: ReplaySubject<T>}>;
    private sharedWatcherPool = {};
    private comparator: CacheComparator<T>;

    constructor(initialData = {}, comparator?: CacheComparator<T>) {
        this.cache      = new BehaviorSubject(initialData);
        this.comparator = comparator;
    }

    public put(id: string, item: T): void {

        if (!this.has(id)) {
            this.cache.next(Object.assign(this.cache.getValue(), {[id]: new BehaviorSubject<T>(item)}));
        } else {
            this.cache.getValue()[id].next(item);
        }

    }

    public has(id: string): boolean {
        const all = this.cache.getValue();
        return all[id] !== undefined;
    }

    public watch(id: string): Observable<T> {
        if (!this.sharedWatcherPool[id]) {
            this.sharedWatcherPool[id] = this.cache.switchMap(cache => {
                if (this.has(id)) {
                    return cache[id];
                }
                return Observable.empty();
            }).distinctUntilChanged(this.comparator);
        }

        return this.sharedWatcherPool[id];

    }

    public remove(id: string) {
        if (this.has(id)) {
            const cache = Object.assign(this.cache.getValue(), {});

            cache[id].unsubscribe();
            delete cache[id];

            this.cache.next(cache);
        }
    }

    public all(): BehaviorSubject<{[id: string]: ReplaySubject<T>}> {
        return this.cache;
    }
}
