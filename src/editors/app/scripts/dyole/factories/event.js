/**
 * Created by filip on 9.10.14..
 */

'use strict';

angular.module('registryApp.dyole')
    .factory('event', function() {

        return {
            /**
             * Container object holding the event subscriptions list.
             *
             * @type {Object}
             */
            subscriptions: {},

            /**
             * Event object handler invoker - method called when invoking an
             * already subscribed event.
             *
             * @param {string} name - Name of the event being fired.
             * @param {?*} eventArguments - Optional event arguments to be passed to the
             *                                                          handler method.
             */
            trigger: function(name, eventArguments) {
                if (typeof this.subscriptions[name] !== 'undefined' &&
                    this.subscriptions[name] instanceof Array) {

                    for (var i = 0; i < this.subscriptions[name].length; i++) {

                        var subscription = this.subscriptions[name][i];

                        if (typeof subscription.handler === 'function') {

                            var args = Array.prototype.slice.call(arguments);

                            args = args.slice(1, args.length);
                            subscription.handler.apply(subscription.scope, args);

                        }
                    }
                }
            },

            /**
             * The subscriber method, adding the subscribed event, its handler and
             * the scope to the Event watcher object.
             *
             * @param {string} name
             * @param {string} handler
             * @param {Object} scope
             */
            subscribe: function(name, handler, scope) {

                scope = scope || this;

                this._checkSubscriptionParams(name, handler, scope);

                if (typeof this.subscriptions[name] === 'undefined') {

                    this.subscriptions[name] = [];
                }

                if (!this._isSubscribed(name, handler, scope)) {

                    this.subscriptions[name].push({'handler': handler, 'scope': scope});
                }
            },

            /**
             * The unsubscribe method, adding the subscribed event, its handler and
             * the scope to the Event watcher object.
             *
             * @param {string} name
             * @param {function} handler
             */
            unsubscribe: function(name, handler) {

                if (typeof name === 'undefined') {
                    throw 'Invalid parameter exception: No event name specified.';
                }

                // Considered throwing an exception here as well, but might be too
                // restrictive - so instead method will just exit.
                if (typeof this.subscriptions[name] === 'undefined' || !(this.subscriptions[name] instanceof Array)) {

                    throw 'Error: Subscription "' + name + '" does\'t exist';
                }

                if (typeof handler === 'undefined') {
                    delete this.subscriptions[name];
                } else {
                    for (var i = 0, l = this.subscriptions[name].length; i < l; i++) {

                        if (this.subscriptions[name][i].handler === handler) {

                            this.subscriptions[name].splice(i, 1);

                            if (this.subscriptions[name].length === 0) {
                                delete this.subscriptions[name];
                            }

                            break;
                        }

                    }
                }


            },

            /**
             * Helper method that checks if all the parameters for subscription have
             * been properly set and if not throws an error.
             *
             * @param {string} name
             * @param {string} handler
             * @param {Object} scope
             */
            _checkSubscriptionParams: function(name, handler, scope) {
                // Subscription event name must be defined.
                if (typeof name === 'undefined') {
                    throw 'Invalid parameter exception: No event name specified.';
                }

                // Subscription event handler must be defined.
                if (typeof handler === 'undefined') {
                    throw 'Invalid parameter exception: No event handler specified.';
                }

                // Subscription event handler scope must be defined.
                if (typeof scope === 'undefined') {
                    throw 'Invalid parameter exception: No event handler scope specified.';
                }

                // Type of the subscription event name parameter must be a string.
                if (typeof name !== 'string') {
                    throw 'Invalid parameter exception: Event name must be a string.';
                }

            },

            /**
             * Helper method checking if the same event with the same handler has
             * already been added to avoid double invocation.
             *
             * @param {string} name
             * @param {string} handler
             * @param {Object} scope
             * @return {boolean}
             */
            _isSubscribed: function(name, handler, scope) {
                var subscribed = false;

                for (var i = 0; i < this.subscriptions[name].length; i++) {

                    var subscription = this.subscriptions[name][i];

                    if (subscription.handler === handler && subscription.scope === scope) {

                        subscribed = true;
                    }
                }

                return subscribed;
            }
        };
    });
