/**
 * Author: Milica Kadic
 * Date: 12/18/14
 * Time: 1:37 PM
 */

'use strict';


angular.module('registryApp.common')
    .factory('BeforeUnload', ['lodash', function(_) {

        var callback;
        var prompt;

        /**
         * Attach event listener
         *
         * @param type
         * @param handler
         */
        var attachEvent = function(type, handler) {

            if (typeof window.addEventListener === 'function') {
                window.addEventListener(type, handler, false);
            } else if (typeof document.attachEvent === 'function') {
                document.attachEvent('on' + type, handler);
            } else {
                window['on' + type] = handler;
            }

        };

        /**
         * Remove event listener
         *
         * @param type
         * @param handler
         */
        var detachEvent = function(type, handler) {

            if (typeof window.removeEventListener === 'function') {
                window.removeEventListener(type, handler, false);
            } else if (typeof document.detachEvent === 'function') {
                document.detachEvent('on' + type, handler);
            } else {
                window['on' + type] = null;
            }

        };

        /**
         * On before unload handler
         *
         * @param event
         * @returns {*}
         */
        var onBeforeUnloadHandler = function(event) {
            var message,
                shouldPrompt;

            if (typeof callback === 'function') {
                message = callback();
            }
            if (typeof prompt === 'function') {
                shouldPrompt = prompt();
            } else if (_.isUndefined(prompt)) {
                // always prompt if shouldPrompt is not a function or boolean
                shouldPrompt = true;
            }

            if (shouldPrompt) {
                (event || window.event).returnValue = message;

                return message;
            }
        };

        /**
         * Register beforeunload event
         *
         * @param messageCallback
         * @param shouldPrompt {Function | boolean}
         * @returns {Function}
         */
        var register = function(messageCallback, shouldPrompt) {

            attachEvent('beforeunload', onBeforeUnloadHandler);

            callback = messageCallback;

            prompt = shouldPrompt;

            return function(messageCallback) {

                detachEvent('beforeunload', onBeforeUnloadHandler);

                if (typeof messageCallback === 'function') {
                    messageCallback.call();
                }
            };
        };

        return {
            register: register
        };

    }]);