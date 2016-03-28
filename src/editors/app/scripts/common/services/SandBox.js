/**
 * Created by filip on 23.9.14..
 */

'use strict';

angular.module('registryApp.common')
    .factory('SandBox', ['$q', 'Cliche', 'lodash', '$window', function($q, Cliche, _, $window) {

        var Sandbox;

        return {
            /**
             * Evaluate js code
             *
             * @param code {string}
             * @param input {object}
             *
             * success {function}
             *  - first param of the callback is evaluated code result
             * err {function}
             *  - triggered when execution fails, first parameter is err object
             *  - when err is triggered success isn't
             */
            evaluate: function(code, input) {

                Sandbox = new $window.JSandbox();

                var deferred = $q.defer();
                var job = Cliche.getJob();

                if (typeof input === 'object' && job) {
                    input.$job = job;
                }

                // trim whitespace from beggining and end of code string
                code = code.replace(/(^\s+|\s+$)/g, '');

                // check if code starts with { to wrap it in closure
                if (code.charAt(0) === '{') {
                    code = '(function()' + code + ')()';
                }

                Sandbox.eval(
                    code,
                    function success(result) {
                        deferred.resolve(result);
                        this.terminate();
                    },
                    input,
                    function err(error) {
                        deferred.reject(error);
                        this.terminate();
                    });

                return deferred.promise;
            },

            evaluateByArg: function(code, arg) {

                var self = this;

                if (_.isArray(arg)) {

                    var promises = [];

                    _.each(arg, function(o) {
                        promises.push(
                            self.evaluate(code, {$self: o})
                                .then(function(result) {
                                    return !result && isNaN(result) ? null : result;
                                })
                        );
                    });

                    return $q.all(promises);

                } else {
                    return self.evaluate(code, {$self: arg})
                        .then(function(result) {
                            return !result && isNaN(result) ? null : result;
                        });
                }

            },

            terminate: function() {
                if (angular.isDefined(Sandbox)) {
                    Sandbox.terminate();
                    Sandbox = undefined;
                }
            }

        };
    }]);
