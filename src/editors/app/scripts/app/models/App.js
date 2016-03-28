'use strict';

angular.module('registryApp.app')
    .factory('App', ['$q', 'Api', 'SchemaValidator', 'lodash', 'Globals', function($q, Api, SchemaValidator, _, Globals) {
        var self = {};
        var revision = parseInt(Globals.revision);

        /**
         * Get tools
         *
         * @returns {*}
         */
        self.getTools = function() {

            return Api.apps.get({}).$promise;
        };

        /**
         * Get script tools
         *
         * @returns {*}
         */
        self.getScripts = function() {

            return Api.apps.get({}).$promise;

        };

        /**
         * Get workflows
         *
         * @returns {*}
         */
        self.getWorkflows = function() {

            return Api.apps.get({}).$promise;
        };

        /**
         * Get tool
         *
         * @returns {object} $promise
         */
        self.get = function() {

            if (!_.isNaN(revision)) {
                return Api.apps.get({revision: revision}).$promise;
            } else {
                return Api.apps.get().$promise;
            }
        };

        /**
         * Fetch app's JSON object.
         *
         * @param {Object} appData    Object containt owner username, project slug, app name.
         * @returns {Promise}
         */
        self.getApp = function(appData) {

            return Api.getApp.get(appData).$promise;
        };

        /**
         * Update the tool - create new revision
         *
         * @param app
         * @param type
         * @returns {*}
         */
        self.update = function(app, type) {

            return SchemaValidator.validate(type, app)
                .then(function() {
                    return Api.apps.get().$promise.then(function(latest) {
                        var rev = latest.message['sbg:revision'] + 1;
                        return Api.apps.update({revision: rev}, app).$promise;
                    });
                }, function(trace) {
                    return $q.reject(trace);
                });

        };

        /**
         * Save SVG string for current workflow
         *
         * @param {number} revision
         * @param {string} svgString
         */
        self.updateSvg = function(revision, svgString) {
            return Api.apps.update({revision: revision, svg: 'svg'}, {svg: svgString}).$promise;
        };

        self.validateJson = function(json) {
            return Api.validateApp.validate({}, json).$promise;
        };

        self.getAppUrl = function(json) {
            return Globals.apiUrls.brood + 'apps/' + Globals.appUrl;
        };

        self.flush = function(type) {
//            return $localForage.removeItem(type);
        };

        self.getPublicAppsByProject = function() {
            return Api.getPublicAppsByProject.get({}).$promise;
        };

        self.getMineAppsByProject = function() {
            return Api.getMineAppsByProject.get({}).$promise;
        };

        self.createAppTask = function(rev) {
            /*
             {
             "type": "RABIX",
             "project_id": "a6157d3d-c375-4303-a50e-0ef3143bbb86",
             "project_slug": "bojan.delic/mytestrabix-project/",
             "app_id": "luka.stojanovic/picard/picard-clean-sort-dedupe/0"
             }
             */

            var body = {
                type: 'RABIX',
                'project_id': Globals.projectId,
                'project_slug': Globals.projectOwner + '/' + Globals.projectSlug,
                'app_id': Globals.projectOwner + '/' + Globals.projectSlug + '/' + Globals.appName + '/' + rev
            };

            return Api.createAppTask.post({}, body).$promise;
        };

        self.redirectToTaskPage = function(task) {
            var url = '/u/' + Globals.projectOwner + '/' + Globals.projectSlug + '/tasks/' + task.message.platform_id;

            window.location = url;
        };

        self.checkOutdatedInWf = function(list) {
            return Api.checkOutdatedInWf.post({}, list).$promise;
        };

        self.getValidInstances = function() {
            return Api.getValidInstances.get().$promise;
        };

        return self;

    }]);