/**
 * Author: Milica Kadic
 * Date: 1/14/15
 * Time: 4:23 PM
 */

'use strict';

angular.module('registryApp.common')
    .factory('Helper', ['$injector', 'lodash', function($injector, _) {

        /**
         * Check if name is valid
         *
         * @param {string} name
         * @param {boolean} whiteSpace
         * @returns {boolean}
         */
        var isValidName = function(name, whiteSpace) {

            if (_.isEmpty(name)) {
                return false;
            }

            // because of inputs starting with # by default
            var pattern = /[\w#]*/g;

            if (whiteSpace) {
                pattern = /[\w\s#]*/g;
            }

            var matches = name.match(pattern);
            return matches.length && name === name.match(pattern)[0];
        };

        /**
         * Check if value is integer
         *
         * @param {integer} int
         * @returns {boolean}
         */
        var isValidInt = function(int) {

            int = int || 0;

            return int === parseInt(int, 10);

        };

        /**
         * Get current domain with appropriate protocol and port
         *
         * @returns {string}
         */
        var getDomain = function() {

            var $location = $injector.get('$location');

            var port = $location.port() ? (':' + $location.port()) : '';

            return $location.protocol() + '://' + $location.host() + port;

        };

        /**
         * Returns a random integer between min (included) and max (excluded)
         *
         * @param {integer} min
         * @param {integer} max
         * @returns {integer}
         */
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }

        /**
         * Returns a random floating number between min (inclusive) and max (exclusive)
         *
         * @param {integer} min
         * @param {integer} max
         * @returns {float}
         */
        function getRandomFloat(min, max) {
            return Math.random() * (max - min) + min;
        }

        /**
         * Test data for the $self context of the expression
         *
         * @param {string} type
         * @param {string} itemType
         * @returns {*}
         */
        var getTestData = function(type, itemType) {

            var output;
            var map = {
                File: {
                    path: 'i-am-file.txt',
                    'class': 'classname',
                    secondaryFiles: [
                        'file1', 'file2'
                    ],
                    size: 1234
                },
                directory: 'dir-me-dir-me-a-man_after_midnight',
                string: 'test',
                int: 42,
                float: 332.1234242,
                boolean: false,
                array: {
                    File: {
                        path: 'i-am-file.txt',
                        'class': 'classname',
                        secondaryFiles: [
                            'file1', 'file2'
                        ],
                        size: 1234
                    },
                    directory: 'dir-me-dir-me-a-man_after_midnight',
                    string: 'test',
                    int: 42,
                    float: 332.1234242
                }
            };

            output = map[type];

            if (itemType) {
                output = output[itemType];
            }

            return output;

        };

        /**
         * Get default input value when creating new input
         *
         * @param {string} name
         * @param {array} symbols
         * @param {string} type
         * @param {string} itemType
         * @returns {*}
         */
        var getDefaultInputValue = function(name, symbols, type, itemType) {

            var output;
            var map = {
                file: {path: '/path/to/' + name + '.ext', 'class': 'File', size: 0, secondaryFiles: []},
                File: {path: '/path/to/' + name + '.ext', 'class': 'File', size: 0, secondaryFiles: []},
                'enum': symbols ? symbols[0] : name,
                string: name + '-string-value',
                int: getRandomInt(0, 11),
                float: getRandomFloat(0, 11),
                boolean: true,
                record: {},
                map: {},
                array: {
                    file: [
                        {path: '/path/to/' + name + '-1.ext', 'class': 'File', size: 0, secondaryFiles: []},
                        {path: '/path/to/' + name + '-2.ext', 'class': 'File', size: 0, secondaryFiles: []}
                    ],
                    File: [
                        {path: '/path/to/' + name + '-1.ext', 'class': 'File', size: 0, secondaryFiles: []},
                        {path: '/path/to/' + name + '-2.ext', 'class': 'File', size: 0, secondaryFiles: []}
                    ],
                    string: [name + '-string-value-1', name + '-string-value-2'],
                    int: [getRandomInt(0, 11), getRandomInt(0, 11)],
                    float: [getRandomFloat(0, 11), getRandomFloat(0, 11)],
                    record: [],
                    map: [{}],
                    'enum': [symbols ? symbols[0] : name]
                }
            };

            output = map[type];

            if (itemType) {
                output = output[itemType];
            }

            return output;

        };

        /**
         * Stop propagation
         *
         * @param e
         */
        var stopPropagation = function(e) {

            if (_.isUndefined(e)) {
                return false;
            }

            if (typeof e.stopPropagation === 'function') {
                e.stopPropagation();
            }
            if (typeof e.cancelBubble !== 'undefined') {
                e.cancelBubble = true;
            }

        };

        /**
         * recursively search object for Existence of property or property === value
         * @param {Object} obj
         * @param {string} prop string to be checked for occurrence in object
         * @param {string} [val] optional value to compare property to
         * @returns {*}
         */
        function deepPropValue(obj, prop, val) {
            var result = null;

            if (obj instanceof Array) {
                for (var i = 0; i < obj.length; i++) {
                    result = deepPropValue(obj[i], prop, val);
                    if (result) {
                        break;
                    }
                }
            } else {
                for (var oProp in obj) {
                    if (!obj.hasOwnProperty(oProp)) {
                        continue;
                    }
                    if (oProp === prop) {
                        if (_.isUndefined(val)) {
                            return obj;
                        } else if (obj[oProp] === val) {
                            return obj;
                        }
                    }
                    if (obj[oProp] instanceof Object || obj[oProp] instanceof Array) {
                        result = deepPropValue(obj[oProp], prop, val);
                        if (result) {
                            break;
                        }
                    }
                }
            }

            return result;
        }

        var deepPropertyExists = function(obj, prop) {
            return !!deepPropValue(obj, prop);
        };

        var deepPropertyEquals = function(obj, prop, val) {
            return !!deepPropValue(obj, prop, val);
        };

        return {
            isValidName: isValidName,
            isValidInt: isValidInt,
            getDomain: getDomain,
            getTestData: getTestData,
            getDefaultInputValue: getDefaultInputValue,
            stopPropagation: stopPropagation,
            deepPropertyExists: deepPropertyExists,
            deepPropertyEquals: deepPropertyEquals
        };

    }]);