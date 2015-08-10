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
		    templateUrl: 'app/main/editor/editor.html',
		    controller: 'EditorController',
		    controllerAs: 'edit',
		    onEnter: function() {
			    console.log('entered editor');
			    
		    }
	    });

    $urlRouterProvider.otherwise('/');
}

export default routerConfig;
