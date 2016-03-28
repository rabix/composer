'use strict';

angular.module('registryApp.common')
    .service('Api', ['$resource', '$http', function($resource, $http) {

        var self = {};
        var apiUrl = '/api';

        self.apps = $resource(apiUrl + '/apps/:id/:revision', {id: '@id', revision: '@revision'}, {
            add: {method: 'POST'},
            'delete': {method: 'DELETE'}
        });

        self.jobs = $resource(apiUrl + '/jobs/:id', {id: '@id'}, {
            add: {method: 'POST'},
            update: {method: 'PUT'},
            'delete': {method: 'DELETE'}
        });

        self.pipelines = $resource(apiUrl + '/workflows/:id', {id: '@id'}, {
            add: {method: 'POST'},
            update: {method: 'PUT'},
            'delete': {method: 'DELETE'}
        });

        self.pipelineRevs = $resource(apiUrl + '/workflow-revisions/:id', {id: '@id'}, {
            add: {method: 'POST'},
            update: {method: 'PUT'},
            'delete': {method: 'DELETE'}
        });

        self.formatPipeline = $resource(apiUrl + '/workflow/format/:action', {action: '@action'}, {
            format: {method: 'POST'}
        });

        self.validatePipeline = $resource(apiUrl + '/workflow/validate/', {}, {
            validate: {method: 'POST'}
        });

        self.forkPipeline = $resource(apiUrl + '/workflows/fork', {}, {
            fork: {method: 'POST'}
        });

        self.groupedTools = $resource(apiUrl + '/tool/repositories/:type', {type: '@type'});

        self.groupedWorkflows = $resource(apiUrl + '/workflow/repositories/:type', {type: '@type'});

        self.revisions = $resource(apiUrl + '/revisions/:id', {id: '@id'}, {
            add: {method: 'POST'},
            'delete': {method: 'DELETE'}
        });

        self.builds = $resource(apiUrl + '/builds/:id', {id: '@id'});

        self.log = function(range) {
            return $resource(apiUrl + '/builds/:id/log', {id: '@id'}, {
                get: {
                    method: 'GET',
                    headers: {'range': 'bytes=' + range + '-'},
                    transformResponse: [function(data) {
                        return {content: JSON.parse(data)};
                    }].concat($http.defaults.transformResponse)
                }
            });
        };

        self.repos = $resource(apiUrl + '/repos/:id/:action', {id: '@id', action: '@action'}, {
            add: {method: 'POST'},
            update: {method: 'PUT'}
        });

        self.repoTools = $resource(apiUrl + '/repo-tools/:id', {id: '@id'});

        self.repoWorkflows = $resource(apiUrl + '/repo-workflows/:id', {id: '@id'});

        self.repoTasks = $resource(apiUrl + '/repo-tasks/:id', {id: '@id'});

        self.gitHubRepos = $resource(apiUrl + '/github-repos', {}, {
            add: {method: 'POST'},
            update: {method: 'PUT'}
        });

        self.user = $resource(apiUrl + '/user/:action', {action: '@action'}, {
            update: {method: 'PUT'},
            'delete': {method: 'DELETE'}
        });

        self.subscribe = $resource(apiUrl + '/subscribe', {}, {
            post: {method: 'POST'}
        });

        return self;


    }]);