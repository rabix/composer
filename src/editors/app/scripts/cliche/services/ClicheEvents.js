/**
 * Created by majanedeljkovic on 7/28/15.
 */


/**
 * Service for keeping track of event names
 */
angular.module('registryApp.cliche')
    .service('ClicheEvents', [function() {

        return {
            EXPRESSION: {
                CHANGED: 'expression:changed',
                NEW: 'expression:new',
                DELETED: 'expression:deleted'
            },
            JOB: {
                CHANGED: 'job:changed'
            }
        };
    }]);