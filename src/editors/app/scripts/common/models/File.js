/**
 * Created by filip on 4.5.15..
 */

'use strict';

angular.module('registryApp.app')
    .factory('File', ['$q', 'Api', 'lodash', 'Globals', function($q, Api, _, Globals) {

        var self = {};

        self.getFiles = function() {
            return Api.files.get({}).$promise;
        };

        self.getFilesInProject = function(config) {
            var path = Globals.projectId;
            config = config || {};
            config.limit = config.limit || 0;
            config.offset = config.offset || 5;
            config.folders = config.folders || false;

            if (typeof config.path !== 'undefined') {
                path += config.path;
            }

            var query = {
                query: 'IN \"/Projects/' + path + '\" WHERE (' + ( config.folders ? 'type = \"DIRECTORY\" OR ' : '' ) + '((type = \"FILE\" AND attr(\"vis_details\") = \"\" AND (state = \"AVAILABLE\" OR (state = \"UPLOADING\" AND attr(\"produced_by_task\") = \"\"))))) ORDER BY type ASC, name ASC LIMIT ' + config.limit + ', ' + config.offset
            };

            return Api.filesInProject.post({folders: config.folders}, query).$promise;
        };

        /**
         * Get file stats
         *
         * @param file
         * @returns {$promise|*}
         */
        self.getStat = function(file) {
            return Api.fileStats.get({file: file}).$promise;
        };

        return self;
    }]);