'use strict';

angular.module('registryApp.app')
    .factory('Tool', ['$q', 'Api', 'SchemaValidator', 'lodash', function($q, Api, SchemaValidator, _) {

        /**
         * Get list of tools
         *
         * @param {integer} skip
         * @param {string} searchTerm
         * @param {boolean} mine
         * @returns {*}
         */
        var getTools = function(skip, searchTerm, mine) {

            var isSearch = !(_.isUndefined(searchTerm) || _.isEmpty(searchTerm));
            var params = {skip: (skip || 0)};

            if (isSearch) {
                params.q = searchTerm;
            }

            params.mine = mine || null;

            return Api.apps.get(params).$promise;

        };

        /**
         * Get script tools
         *
         * @param {integer} skip
         * @param {string} searchTerm
         * @returns {*}
         */
        var getScripts = function(skip, searchTerm, mine) {

            var isSearch = !(_.isUndefined(searchTerm) || _.isEmpty(searchTerm));
            var params = {skip: skip || 0, is_script: true};

            if (isSearch) {
                params.q = searchTerm;
            }

            params.mine = mine || null;

            return Api.apps.get(params).$promise;

        };

        /**
         * Get tool by id
         *
         * @param id
         * @param revision
         * @returns {object} $promise
         */
        var getTool = function(id, revision) {

            return Api.apps.get({id: id, revision: revision}).$promise;

        };

        /**
         * Create new tool
         *
         * @param repoId
         * @param tool
         * @param job
         * @param type
         * @returns {*}
         */
        var create = function(repoId, tool, job, type) {

            return SchemaValidator.validate(type, _.clone(tool, true))
                .then(function() {
                    return Api.apps.add({id: 'create'}, {tool: tool, job: job, repo_id: repoId}).$promise;
                }, function(trace) {
                    return $q.reject(trace);
                });

        };

        /**
         * Fork the current tool
         *
         * @param repoId
         * @param name
         * @param tool
         * @param job
         * @param type
         * @returns {*}
         */
        var fork = function(repoId, name, tool, job, type) {

            return SchemaValidator.validate(type, tool)
                .then(function() {
                    return Api.apps.add({id: 'fork'}, {tool: tool, job: job, repo_id: repoId, name: name}).$promise;
                }, function(trace) {
                    return $q.reject(trace);
                });

        };

        /**
         * Update the tool - create new revision
         *
         * @param appId
         * @param tool
         * @param job
         * @param type
         * @returns {*}
         */
        var update = function(appId, tool, job, type) {

            return SchemaValidator.validate(type, tool)
                .then(function() {
                    return Api.apps.update({}, tool).$promise;
                }, function(trace) {
                    return $q.reject(trace);
                });

        };

        /**
         * Get list of tool's revisions
         *
         * @param {integer} skip
         * @param {string} searchTerm
         * @param {integer} appId
         * @returns {object} $promise
         */
        var getRevisions = function(skip, searchTerm, appId) {

            var isSearch = !(_.isUndefined(searchTerm) || _.isEmpty(searchTerm));
            var params = {skip: skip || 0};

            if (isSearch) {
                params.q = searchTerm;
            }

            if (angular.isDefined(appId)) {
                params.field_app_id = appId;
            }

            return Api.revisions.get(params).$promise;

        };

        /**
         * Get revision by id
         *
         * @param id
         * @returns {object} $promise
         */
        var getRevision = function(id) {

            return Api.revisions.get({id: id}).$promise;

        };

        /**
         * Get tools grouped by repositories
         *
         * @returns {*}
         */
        var getGroupedTools = function(type, searchTerm) {

            return Api.groupedTools.get({type: type, q: searchTerm}).$promise;

        };

        /**
         * Delete tool by id
         *
         * @param id
         * @returns {*}
         */
        var deleteTool = function(id) {

            return Api.apps.delete({id: id}).$promise;

        };

        /**
         * Delete revision by id
         *
         * @param id
         * @returns {*}
         */
        var deleteRevision = function(id) {

            return Api.revisions.delete({id: id}).$promise;

        };

        return {
            getTools: getTools,
            getScripts: getScripts,
            getTool: getTool,
            create: create,
            fork: fork,
            update: update,
            getRevisions: getRevisions,
            getRevision: getRevision,
            getGroupedTools: getGroupedTools,
            deleteTool: deleteTool,
            deleteRevision: deleteRevision
        };

    }]);