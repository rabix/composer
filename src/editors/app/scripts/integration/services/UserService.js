/**
 * @ngdoc service
 * @name rabixApp.UserService
 * @description
 * _Please update the description and dependencies._
 *
 * @requires $replace_me
 *
 * */

'use strict';

angular.module('integration')
    .service('User', ['$q', function($q) {

        var Mock = {
            '__v': 0,
            '_id': '54eda612a34a28530b3c42f7',
            'email': 'filip.jelic@sbgenomics.com',
            'github': {
                'id': 8544164,
                'github_id': 8544164,
                'name': null,
                'repos_url': 'https://api.github.com/users/filip-sbg/repos',
                'url': 'https://api.github.com/users/filip-sbg',
                'gravatar_id': '',
                'avatar_url': 'https://avatars.githubusercontent.com/u/8544164?v=3',
                'login': 'filip-sbg'
            },
            'username': 'filip-sbg'
        };

        return {
            getUser: function() {

                var deferred = $q.defer();

                deferred.resolve({user: Mock});

                return deferred.promise;
            }
        };
    }]);

