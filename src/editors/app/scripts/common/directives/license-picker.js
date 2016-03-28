/**
 * created by maya on 17.9.2015.
 */

'use strict';

angular.module('registryApp.common')
    .controller('LicensePickerCtrl', ['$scope', 'lodash', 'Licenses', '$q', function($scope, _, Licenses, $q) {
        $scope.licenses = Licenses.getLicenses();
        var list = [];
        for (var key in $scope.licenses) {
            if ($scope.licenses.hasOwnProperty(key)) {
                var license = $scope.licenses[key];
                license.id = key;
                list.push(license);
            }
        }

        function filterFunction(list, input) {
            var regex = new RegExp(input.toLowerCase().split('').join('.*'));

            return _(list).filter(function(license) {
                var nameScore = license.name.toLowerCase().search(regex);

                if (nameScore !== -1) {
                    license.score = nameScore;
                    return license;
                }
            }).sortBy(function(license) {
                // popular licenses should always be on top
                return license.isPopular ? '0_' + license.score + license.name.length : '1_' + license.score + license.name.length;
            }).value().slice(0, 8);
        }

        $scope.filterResults = function(input) {
            var deferred = $q.defer();

            deferred.resolve(filterFunction(list, input));

            return deferred.promise;
        };
    }])

    .directive('licensePicker', ['$templateCache', function($templateCache) {
        return {
            restrict: 'E',
            scope: {
                ngModel: '='
            },
            template: $templateCache.get('views/partials/license-picker.html'),
            controller: 'LicensePickerCtrl'
        };
    }]);