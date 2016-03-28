/**
 * Created by jovica on 1.12.15.
 */

angular.module('registryApp.util')
    .filter('repoApps', [function() {

        'use strict';

        function filterByTerm(term) {
            return function strContains(string) {
                return string.indexOf(term) !== -1;
            };
        }

        /**
         * @param {Array} apps
         * @param {string} searchTerm
         *
         * @returns {Array} filtered apps
         */
        return function(apps, searchTerm) {

            var filter = filterByTerm(searchTerm);

            if (_.isEmpty(searchTerm)) {
                return apps;
            }

            return _.filter(apps, function(app) {
                // ID, label, toolkit, categories and possibly description fields.
                return filter(app.app_name) || filter(app.label) || filter(app.toolkit) || //filter(description) ||
                    _.filter(app.categories, filter).length > 0;

            });
        };
    }]);