/**
 * Created by filip on 2/2/15.
 */

'use strict';

/**
 * PipelineService is used for MainController interaction with pipeline instance
 */
angular.module('registryApp.dyole').service('PipelineService', [function() {

    var service,
        pipelines = {},
        refresh = {},
        toCall = {};

    service = {

        refresh: function(id) {
            if(refresh[id] && _.isFunction(refresh[id])) {
                refresh[id]();
            }
        },

        pipelines: pipelines,

        /**
         * Register Controller to get Instance of pipeline for it
         *
         * @param id
         * @param onRegister
         * @param onRefresh
         */
        register: function(id, onRegister, onRefresh) {

            pipelines[id] = pipelines[id] || null;

            if (onRegister) {
                toCall[id] = onRegister;
            }

            if (onRefresh) {
                refresh[id] = onRefresh;
            }

            //console.log('All registered: ', pipelines);
            //console.log('Registered Controller: ', id);
        },

        /**
         * Set Pipeline instance based on Controller id
         *
         * @param id
         * @param instance
         */
        setInstance: function(id, instance) {
            if (id && instance) {
                pipelines[id] = instance;

                if (toCall[id]) {

                    toCall[id]();

                    // destroy after calling it
                    toCall[id] = null;
                    delete toCall[id];
                }
            }

        },

        /**
         * Get Pipeline instance based on Controller id
         *
         * @param id
         * @returns {*}
         */
        getInstance: function(id) {

            if (pipelines[id]) {
                return pipelines[id];
            }

            return false;

        },

        /**
         * Remove Controller id and instance associated with it
         *
         * @param id
         */
        removeInstance: function(id) {
            if (pipelines[id]) {
                pipelines[id] = null;
                delete pipelines[id];
            }
        }

    };

    return service;

}]);