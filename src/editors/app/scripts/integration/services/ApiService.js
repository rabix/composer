/**
 * @ngdoc service
 * @name clicheApp.ApiService
 * @description
 * Api override
 *
 * @requires $resource, $http, Globals
 *
 * */


angular.module('integration')
    .service('Api', ['$resource', '$http', 'Globals', function($resource, $http, Globals) {
        'use strict';

        var self = {};
        var sessionId = Globals.user.sessionId;
        var brood = Globals.apiUrls.brood;
        var broodAppUrl = brood + 'apps';
        var vaporUrl = Globals.apiUrls.vaporStore;
        var projectOwner = Globals.projectOwner;
        var projectSlug = Globals.projectSlug;
        var appName = Globals.appName;
        var revision = parseInt(Globals.revision, 10);
        var getAppsUrl = Globals.get_apps_url;
        var checkOutdatedUrl = 'updates';
        var getMineAppsByProject = 'aggregate?group_by=project&func=array&visibility=mine';
        var getPublicAppsByProject = 'aggregate?group_by=project&func=array&visibility=public';
        var validateAppUrl = brood + 'validate/app';
        var headers = {
            'Content-Type': 'application/json',
            'session-id': sessionId
        };

        var peon = Globals.apiUrls.peon;

        self.apps = $resource(broodAppUrl + '/' + projectOwner + '/' + projectSlug + '/' + appName + '/:revision/:svg', {revision: '@revision'}, {
            'post': {method: 'POST', headers: headers},
            'update': {method: 'POST', headers: headers, params: {svg: '@svg'}},
            'get': {method: 'GET', headers: headers, params: {'_role': 'default'}},
            'delete': {method: 'DELETE', headers: headers}
        });

        self.getApp = $resource(broodAppUrl + '/:projectOwner/:projectSlug/:appName', {
            projectOwner: '@projectOwner',
            appName: '@appName',
            projectSlug: '@projectSlug'
        }, {
            'get': {method: 'GET', headers: headers, params: {'_role': 'default'}}
        });

        self.getAllApps = $resource(broodAppUrl + getAppsUrl, {}, {
            'get': {method: 'GET', headers: headers}
        });

        self.getPublicAppsByProject = $resource(brood + getPublicAppsByProject, {}, {
            'get': {method: 'GET', headers: headers}
        });

        self.getMineAppsByProject = $resource(brood + getMineAppsByProject, {}, {
            'get': {method: 'GET', headers: headers}
        });

        self.checkOutdatedInWf = $resource(brood + checkOutdatedUrl, {}, {
            'post': {method: 'POST', headers: headers}
        });

        self.validateApp = $resource(validateAppUrl, {}, {
            'validate': {method: 'POST', headers: headers}
        });

        self.getLatest = $resource(broodAppUrl + '/' + projectOwner + '/' + projectSlug + '/' + appName, {}, {
            'get': {method: 'GET', headers: headers}
        });

        var vs_query_url = vaporUrl + '/v2/query?session_id=' + sessionId + '&direct_descendants_only=:folders';

        self.files = $resource(vaporUrl + '/fs/ls?session_id=' + sessionId + '&path=/Projects/' + Globals.projectId + '&depth=1', {}, {});

        self.filesInProject = $resource(vs_query_url, {folders: '@folders'}, {
            'post': {
                method: 'POST',
                headers: headers
            }
        });

        self.fileStats = $resource(vaporUrl + '/fs/stat?session_id=' + sessionId + '&path=/Projects/' + Globals.projectId + '/:file&depth=1', {file: '@file'}, {});

        self.createAppTask = $resource(peon, {}, {
            'post': {method: 'POST', headers: headers}
        });

        self.getValidInstances = $resource(Globals.apiUrls.manaus + '/packages/instanceTypes.json?bust=' + Date.now(), {}, {
            get: {
                isArray: true
            }
        });

        return self;


    }]);


