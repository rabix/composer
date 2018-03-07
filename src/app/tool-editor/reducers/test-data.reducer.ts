import {AppTestDataMap} from "./index";
import {Action} from "@ngrx/store";
import {InputTestValueChangeAction, AppMockValuesChange, InputRemoveAction, InputIDChangeAction, InputTypeChangeAction} from "./actions";

export function appTestDataReducer(state: AppTestDataMap = {}, action: Action): AppTestDataMap {

    switch (action.type) {

        case InputRemoveAction.type: {
            const {appID, inputID} = action as InputRemoveAction;
            if (!state[appID] || !state[appID].hasOwnProperty(inputID)) {
                return state;
            }

            const appUpdate = {...state[appID]};
            delete appUpdate[inputID];

            return {...state, [appID]: appUpdate};
        }

        case InputIDChangeAction.type: {
            const {appID, oldID, newID} = action as InputIDChangeAction;
            if (!state[appID] || !state[appID].hasOwnProperty(oldID)) {
                return state;
            }

            const appUpdate  = {...state[appID]};
            appUpdate[newID] = state[appID][oldID];
            delete appUpdate[oldID];

            return {...state, [appID]: appUpdate};
        }

        // case InputTypeChangeAction.type: {
        //     const {appID} = action as InputTypeChangeAction;
        //     if (!state[appID]) {
        //         return state;
        //     }
        //
        //
        // }

        case InputTestValueChangeAction.type: {
            const {appID, inputID, value} = action as InputTestValueChangeAction;
            const update                  = Object.assign({}, state);

            if (!update.hasOwnProperty(appID)) {
                update[appID] = {};
            }

            if (update[appID].hasOwnProperty(inputID)) {
                update[appID] = {...update[appID]};
            } else {
                update[appID][inputID] = {};
            }

            if (update[appID][inputID] === value) {
                return state;
            }

            update[appID][inputID] = value;

            return update;
        }
        case AppMockValuesChange.type: {
            const {appID, value: mockValues} = action as AppMockValuesChange;

            const existing = state[appID];
            if (!existing) {
                return {...state, [appID]: mockValues};
            }

            const update = {};
            Object.keys(mockValues).forEach(inputID => {
                if (existing[inputID] === undefined) {
                    update[inputID] = mockValues[inputID];
                    return;
                }

                update[inputID] = existing[inputID];
            });


            return {...state, [appID]: update};
        }

    }


    return state;
}
