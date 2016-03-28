/**
 * Author: Milica Kadic
 * Date: 11/14/14
 * Time: 3:39 PM
 */
'use strict';

angular.module('registryApp.common')
    .directive('paginator', ['$templateCache', function($templateCache) {
        return {
            restrict: 'E',
            template: $templateCache.get('views/partials/paginator.html'),
            scope: {
                page: '=',
                perPage: '@',
                total: '=',
                handler: '&'
            },
            controller: ['$scope', function($scope) {

                $scope.paginator = {};
                $scope.paginator.prev = false;
                $scope.paginator.next = false;
                $scope.paginator.perPage = $scope.perPage ? parseInt($scope.perPage, 10) : 25;
                $scope.paginator.total = 0;


                /**
                 * Go to the next/prev page
                 *
                 * @param dir
                 */
                $scope.goToPage = function(dir) {

                    if (dir === 'prev') {
                        $scope.page -= 1;
                    }
                    if (dir === 'next') {
                        $scope.page += 1;
                    }

                    var limit = ($scope.page - 1) * $scope.paginator.perPage;


                    $scope.handler({limit: limit});

                    $scope.paginator.prev = $scope.page > 1;
                    $scope.paginator.next = ($scope.page * $scope.paginator.perPage) < $scope.total;

                };

                /**
                 * Adjust paginator against the result
                 */
                var resultLoaded = function() {

                    $scope.paginator.prev = $scope.page > 1;
                    $scope.paginator.next = ($scope.page * $scope.paginator.perPage) < $scope.total;
                    $scope.paginator.total = Math.ceil($scope.total / $scope.paginator.perPage);

                };

                resultLoaded();

                $scope.$watch('total', function(n, o) {
                    if (n !== o) {
                        resultLoaded();
                    }
                });

                $scope.$watch('page', function(n, o) {
                    if (n !== o) {
                        resultLoaded();
                    }
                });

            }],
            link: function() {
            }
        };
    }]);
