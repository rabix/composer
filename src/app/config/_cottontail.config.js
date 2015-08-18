/**
 * Created by filip on 8/17/15.
 */

/**
 * Placeholder for config.
 * Config is injected during gulp task.
 */
angular.module('cottontail')
    .factory('Config', function () {
        // TODO: Figure out how to fix this nicely
        return JSON.parse('{{{APP_CONFIG}}}');
    });