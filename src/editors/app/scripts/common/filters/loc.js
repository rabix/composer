angular.module('registryApp.common')
    .filter('loc', [function() {
        'use strict';

        return function(id, configObj) {
            var string = id;
            if (typeof document.l10n == 'function') {
                string = document.l10n.getSync(id, configObj || {});
            }

            return string === id ? '' : string;
        };
    }]);