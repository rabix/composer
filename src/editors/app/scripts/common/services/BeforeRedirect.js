/**
 * Author: Milica Kadic
 * Date: 12/25/14
 * Time: 4:36 PM
 */
'use strict';

angular.module('registryApp.common')
    //.factory('BeforeRedirect', ['$q', '$rootScope', '$modal', '$templateCache', '$state', function($q, $rootScope, $modal, $templateCache, $state) {
    .factory('BeforeRedirect', ['$q', '$rootScope', '$uibModal', '$templateCache', function($q, $rootScope, $modal, $templateCache) {

        var callback;
        var reload = false;
        var onRouteChangeOff;

        /**
         * Track route change in order to prevent loss of changes
         *
         * @param e
         * @param {Object} toState
         * @param {Object} toParams
         */
        var onRouteChange = function(e, toState, toParams) {

            if (reload) {
                return;
            }

            var modalInstance = $modal.open({
                template: $templateCache.get('views/partials/confirm-leave.html'),
                controller: 'ModalCtrl',
                windowClass: 'modal-confirm',
                resolve: {
                    data: function() {
                        return {};
                    }
                }
            });

            modalInstance.result.then(function() {

                if (typeof onRouteChangeOff === 'function') {
                    onRouteChangeOff();
                }

                reload = true;

                if (typeof callback === 'function') {
                    callback().then(function() {
                        $state.go(toState.name, toParams);
                    });
                } else {
                    $state.go(toState.name, toParams);
                }

            });

            e.preventDefault();

        };

        /**
         * Register $stateChangeStart event
         *
         * @param c
         */
        var register = function(c) {

            reload = false;
            callback = c;
            onRouteChangeOff = $rootScope.$on('$stateChangeStart', onRouteChange);

            return onRouteChangeOff;

        };

        /**
         * Set reload value
         *
         * @param {Boolean} value
         */
        var setReload = function(value) {

            reload = value;

        };

        return {
            register: register,
            setReload: setReload
        };

    }]);