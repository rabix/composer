'use strict';

angular.module('registryApp.app')
    .service('Workflow', ['Api', 'lodash', function(Api, _) {

        var self = {};

        /**
         * Get list of workflows
         *
         * @param {integer} skip
         * @param {string} searchTerm
         * @param {boolean} mine
         * @returns {object} $promise
         */
        self.getWorkflows = function(skip, searchTerm, mine) {

            var isSearch = !(_.isUndefined(searchTerm) || _.isEmpty(searchTerm));
            var params = {skip: skip};

            if (isSearch) {
                params.q = searchTerm;
            }

            params.mine = mine || null;

            return Api.pipelines.get(params).$promise;

        };

        /**
         * Get workflow by id
         *
         * @param id
         * @returns {object} $promise
         */
        self.getWorkflow = function(id) {

            return Api.pipelines.get({id: id}).$promise;

        };

        /**
         * Create new or update existing workflow
         *
         * @param id
         * @param data
         * @returns {$promise}
         */
        self.saveWorkflow = function(id, data) {

            var mode = id ? 'update' : 'add';

            return Api.pipelines[mode]({id: id}, {data: data}).$promise;

        };

        /**
         * Delete workflow by id
         *
         * @param id
         * @returns {*}
         */
        self.deleteWorkflow = function(id) {

            return Api.pipelines.delete({id: id}).$promise;

        };

        /**
         * Format workflow revision json
         *
         * @param workflow
         * @returns {$promise|*}
         */
        self.format = function(workflow) {

            return Api.formatPipeline.format({action: ''}, {pipeline: workflow}).$promise;

        };

        /**
         * Upload workflow revision json and return url to file from s3
         *
         * @param workflow
         * @returns {$promise|*}
         */
        self.getURL = function(workflow) {
            return Api.formatPipeline.format({action: 'upload'}, {pipeline: workflow}).$promise;
        };

        /**
         * Fork workflow with current revision
         *
         * @param workflow
         * @returns {$promise|*}
         */
        self.fork = function(workflow) {
            return Api.forkPipeline.fork({}, {pipeline: workflow}).$promise;
        };

        /**
         * Get single revision
         *
         * @param id
         * @returns {$promise|*}
         */
        self.getRevision = function(id) {
            return Api.pipelineRevs.get({id: id}).$promise;
        };

        /**
         * Get all revisions
         *
         * @param skip
         * @param searchTerm
         * @param workflowId
         * @returns {$promise|*}
         */
        self.getRevisions = function(skip, searchTerm, workflowId) {

            var isSearch = !(_.isUndefined(searchTerm) || _.isEmpty(searchTerm));
            var params = {skip: skip};

            if (isSearch) {
                params.q = searchTerm;
            }

            if (angular.isDefined(workflowId)) {
                params.field_pipeline = workflowId;
            }

            return Api.pipelineRevs.get(params).$promise;
        };

        /**
         * Publish workflow revision
         *
         * @param id
         * @param data
         * @returns {$promise|*}
         */
        self.publishRevision = function(id, data) {
            return Api.pipelineRevs.update({id: id}, data || {}).$promise;
        };

        /**
         * Delete workflow revision
         *
         * @param id
         * @returns {$promise|*}
         */
        self.deleteRevision = function(id) {
            return Api.pipelineRevs.delete({id: id}).$promise;
        };

        /**
         * Get workflows grouped by repo
         *
         * @param type
         * @returns {$promise|*|A.$promise}
         */
        self.groupedWorkflows = function(type) {
            return Api.groupedWorkflows.get({type: type}).$promise;
        };

        /**
         * Check if workflow json is valid
         *
         * @param json
         * @returns {*}
         */
        self.validateJson = function(json) {
            return Api.validatePipeline.validate({}, {json: json}).$promise;
        };

        return self;

    }]);