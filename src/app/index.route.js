function routerConfig($stateProvider, $urlRouterProvider) {
    'ngInject';

    $stateProvider
        .state('main', {
            url: '/',
            templateUrl: 'app/main/main.html',
            controller: 'MainController',
            controllerAs: 'main'
        })
        .state('main.ui', {
		    url: 'ui/',
		    templateUrl: 'app/main/ui/ui.html',
		    controller: 'UIController',
		    controllerAs: 'ui'
	    })
        .state('main.editor', {
		    url: 'editor/',
		    templateUrl: 'app/main/ide/ide.html',
		    controller: 'IdeController',
		    controllerAs: 'ide'
	    });

    $urlRouterProvider.otherwise('editor/');
}

export default routerConfig;
