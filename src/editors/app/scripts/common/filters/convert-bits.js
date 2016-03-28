/**
 * Created by filip on 4.5.15..
 */

angular.module('registryApp.common')
    .filter('convertBits', [function() {
        return function(size) {
            var units, i, len;

            if (typeof size === 'undefined') {
                return 'Directory';
            }

            if (typeof size === 'string') {
                size = Number(size);
            }

            if (size < 0) {
                throw Error('Invalid file size.');
            }

            units = ['KB', 'MB', 'GB', 'TB'];

            for (i = 0, len = units.length; i < len; i++) {
                size /= 1024;

                if (size < 1024) {
                    return size.toFixed(1) + " " + units[i];
                }
            }

            return size.toFixed(1) + ' B';

        };
    }]);