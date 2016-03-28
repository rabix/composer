/**
 * Author: Milica Kadic
 * Date: 2/12/15
 * Time: 3:01 PM
 */
'use strict';

angular.module('registryApp.cliche')
    .factory('Validator', ['$q', '$injector', 'lodash', function($q, $injector, _) {

        /**
         * Trace object which contains info about required, invalid and obsolete values
         *
         * @type {Object}
         */
        var trace = {};

        /**
         * Prepare trace object
         */
        var prepare = function() {

            trace = {
                obsolete: {},
                required: [],
                invalid: []
            };

        };

        /**
         * Check if value type of the node is correct
         *
         * @param {*} value
         * @param {*} types
         * @returns {boolean}
         */
        var isValidType = function(value, types) {

            var isValid = function(value, type) {
                if (type === 'array') {
                    return _.isArray(value);
                }
                return typeof value === type;
            };

            if (_.isArray(types)) {

                var valid = _.find(types, function(type) {
                    return isValid(value, type);
                });

                return !_.isUndefined(valid);

            }

            return isValid(value, types);

        };

        /**
         * Set obsolete parameters defined in schema
         *
         * @param prefix
         * @param value
         * @param def
         */
        var setObsolete = function(prefix, value, def) {

            var diff = _.difference(_.keys(value), _.keys(def));

            if (diff.length > 0) {
                trace.obsolete[prefix] = diff;
            }

        };

        /**
         * Set required and invalid values
         *
         * @param prefix
         * @param value
         * @param options
         */
        var setRequiredAndInvalid = function(prefix, value, options) {

            if (options.rec && value) {
                var type;
                if (_.isArray(value.type)) {
                    type = value.type[1];
                } else {
                    type = value.type;
                }
                if (_.isObject(type) && type.type === 'array' && type.items && type.items.fields) {
                    validate({
                        json: type.items.fields,
                        parent: prefix,
                        def: options.def,
                        strict: options.def.strict,
                        rec: options.def.rec
                    });
                }
            }

            _.each(options.def, function(attr, key) {

                var val = !_.isNull(value) && !_.isUndefined(value) && !_.isUndefined(value[key]) ? value[key] : undefined;

                if (_.isUndefined(val)) {
                    if (attr.required) {
                        trace.required.push(prefix + ':' + key);
                    }
                } else {
                    if (!isValidType(val, attr.type)) {
                        trace.invalid.push(prefix + ':' + key);
                    }
                }

            });

        };

        /**
         * Get node name
         *
         * @param node
         * @param index
         * @returns {*}
         */
        var getNodeName = function(node, index) {

            if (node['id']) {
                return node['id'];
            } else {
                if (node.name) {
                    return node.name;
                } else {
                    return index;
                }
            }

        };

        /**
         * Get next node object
         *
         * @param j
         * @param key
         * @returns {*}
         */
        var getNextNode = function(j, key) {

            return (j && j[key]) ? j[key] : null;

        };

        /**
         * Validate schema recursively
         *
         * @param options
         */
        var validate = function(options) {

            options.strict = _.isUndefined(options.strict) ? true : options.strict;

            if (_.isArray(options.json)) {
                _.each(options.json, function(j, index) {

                    setRequiredAndInvalid(options.parent + '[' + getNodeName(j, index) + ']', j, options);

                    if (options.strict) {
                        setObsolete(options.parent + '[' + getNodeName(j, index) + ']', j, options.def);
                    }
                });
            } else {
                setRequiredAndInvalid(options.parent, options.json, options);

                if (options.strict) {
                    setObsolete(options.parent, options.json, options.def);
                }
            }

            _.each(options.def, function(def, key) {

                if (def.def) {

                    if (_.isArray(options.json)) {
                        _.each(options.json, function(j, index) {
                            validate({
                                json: getNextNode(j, key),
                                parent: options.parent + ':' + key + '[' + getNodeName(j, index) + ']',
                                def: def.def,
                                strict: def.strict,
                                rec: def.rec
                            });
                        });
                    } else {
                        validate({
                            json: getNextNode(options.json, key),
                            parent: options.parent + ':' + key,
                            def: def.def,
                            strict: def.strict,
                            rec: def.rec
                        });
                    }
                }

            });

        };

        /**
         * Init validation
         *
         * @param json
         * @param type
         * @returns {Object}
         */
        var init = function(json, type) {

            var deferred = $q.defer();
            var def = $injector.get(type + 'Definition');

            prepare();

            validate({
                json: json,
                parent: 'root',
                def: def
            });

//            if (_.isEmpty(trace.required) && _.isEmpty(trace.invalid)) {
            deferred.resolve();
//            } else {
//                deferred.reject(trace);
//            }
            //
            //if (_.isEmpty(trace.obsolete) && _.isEmpty(trace.required) && _.isEmpty(trace.invalid)) {
            //    deferred.resolve();
            //} else {
            //    deferred.reject(trace);
            //}

            return deferred.promise;

        };

        return {
            validate: init
        };

    }]);
