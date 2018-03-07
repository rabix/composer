import {Injectable, Inject} from "@angular/core";
import {Store} from "@ngrx/store";
import {pairwise, mergeMap, map, take, tap} from "rxjs/operators";
import {AppState} from "../../reducers";
import {PreviewJobManagerToken, PreviewJobManager} from "../../dependencies";
import {of} from "rxjs/observable/of";
import {Effect, Actions, ofType} from "@ngrx/effects";
import {LoadTestJobAction, AppMockValuesChange} from "../../reducers/actions";
import {Observable} from "rxjs/Observable";

@Injectable()
export class TestJobManagerService {

    /**
     * Listens for a {@see LoadTestJobAction} and pulls stored test job from the backend,
     * then dispatches an {@see AppMockValuesChange} action to update the state
     */
    @Effect()
    private jobLoad = this.actions.pipe(
        ofType(LoadTestJobAction.type),
        mergeMap((action: LoadTestJobAction) => this.testJobManager.get(action.appID).pipe(
            take(1) // Disconnect after initial load, would end up in infinite loop otherwise
        ), (action, testJob) => [action.appID, testJob]),
        map(data => new AppMockValuesChange(data[0], data[1])),
    );

    constructor(private store: Store<AppState>,
                private actions: Actions,
                @Inject(PreviewJobManagerToken)
                private testJobManager: PreviewJobManager) {


        this.getTestJobUpdates().subscribe(update => testJobManager.set(update.appID, update.value));
    }

    /**
     * Watch for changes on test job data for apps, streams ids of apps that have changed and their values
     * Used to know when to save data to backend and for which apps.
     */
    private getTestJobUpdates(): Observable<{ appID: string; value: Object }> {

        return this.store.select("toolEditor", "appTestData").pipe(
            pairwise(),
            mergeMap(pairs => {
                const [oldVal, newVal] = pairs;

                const changes = Object.keys(newVal).reduce((acc, appID) => {
                    if (newVal[appID] !== oldVal[appID]) {
                        return acc.concat({
                            appID,
                            value: newVal[appID]
                        });
                    }
                    return acc;
                }, []);

                return of(...changes);
            })
        );
    }
}
