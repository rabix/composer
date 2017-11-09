import {Observable} from "rxjs/Observable";
import {ReplaySubject} from "rxjs/ReplaySubject";

export class JobService {

    private job = new ReplaySubject<Object>(1);

    constructor(private manager: {
        getJob(): Observable<Object>;
        setJob(data: Object): Promise<any>;
    }) {

        this.manager.getJob().subscribe(this.job);
    }

    setValue(key: string, value: any): Promise<any> {
        return this.job.switchMap(job => {
            const merged = {...job, key: value};
            return this.manager.setJob(merged);
        }).toPromise();
    }

    getValue(key: string): Observable<any> {
        return this.job.map(job => job[key]);
    }
}
