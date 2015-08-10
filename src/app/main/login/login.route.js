/**
 * Created by Maya on 10.8.15.
 */
function routeConfig($stateProvider) {
	'ngInject';

	$stateProvider
		.state('login', {
			url: '/login',
			templateUrl: 'app/main/login/login.html',
			controller: 'LoginController',
			controllerAs: 'login'
		});
}

angular.module('cottontail').config(routeConfig);