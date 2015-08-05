function routerConfig($stateProvider, $urlRouterProvider) {
    'ngInject';

    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: 'app/main/main.html',
            controller: 'MainController',
            controllerAs: 'main'
        })
        .state('home.ui', {
		    url: 'ui/',
		    templateUrl: 'app/main/ui/ui.html',
		    controller: 'UIController',
		    controllerAs: 'ui'
	    });

    $urlRouterProvider.otherwise('/');
}

export default routerConfig;
