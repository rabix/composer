/**
 * Created by Maya on 24.4.15.
 */

'use strict';

angular.module('registryApp.common')
    .service('HotkeyRegistry', ['hotkeys', 'lodash', function(hotkeys, _) {

        var registry = [
            {
                name: 'save',
                shortcut: 'ctrl+s',
                desc: 'Save current work'
            },
            {
                name: 'undo',
                shortcut: 'ctrl+z',
                desc: 'Undo previous action'
            },
            {
                name: 'run',
                shortcut: 'ctrl+shift+r',
                desc: 'Run'
            },
            {
                name: 'redo',
                shortcut: 'ctrl+shift+z',
                desc: 'Redo previous action'
            },
            {
                name: 'delete',
                shortcut: 'del',
                desc: 'Delete item'
            },
            {
                name: 'backspace delete',
                shortcut: 'backspace',
                desc: 'Delete item'
            },
            {
                name: 'confirm',
                shortcut: 'enter',
                desc: 'Accept modal prompt'
            }
        ];

        /**
         * Add hotkey
         *
         * @param shortcut {String}
         * @param desc {String}
         * @param callback {Function}
         * @param [preventDefault] {Boolean}
         * @param [allowIn] {Array}
         * @param context {Object}
         */
        function addHotkey(shortcut, desc, callback, preventDefault, allowIn, context) {
            var config = {
                combo: shortcut,
                description: desc,
                callback: callback,
                context: context || window
            };

            if (!_.isUndefined(allowIn)) {
                config.allowIn = allowIn;
            }

            if (typeof callback === 'function') {
                config.callback = function(event) {
                    !preventDefault || event.preventDefault();

                    callback.call(context);
                }
            } else {
                config.callback = function() {
                };
            }

            hotkeys.add(config);
        }

        /**
         *
         * @param conf {Object | Object[]}
         */
        function loadHotkeys(conf) {
            var toUnload = [];

            /**
             * formats key and sends to be added
             * @param config
             */
            function initKey(config) {
                var hotkey = _.find(registry, {name: config.name});
                toUnload.push(hotkey.shortcut);
                addHotkey(hotkey.shortcut, hotkey.desc, config.callback, config.preventDefault || null, config.allowIn, config.context || window);
            }

            if (_.isArray(conf)) {
                _.forEach(conf, function(c) {
                    initKey(c);
                });
            } else {
                initKey(conf);
            }

            return function unloadHotkeys() {
                _.forEach(toUnload, function(key) {
                    hotkeys.del(key);
                });
            };

        }

        return {
            loadHotkeys: loadHotkeys
        };
    }]);