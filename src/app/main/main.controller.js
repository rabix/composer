class MainController {
    constructor(Api) {
        'ngInject';
      /*  Api.files.query().$promise.then(function(result){
            console.log(result);
        });*/

    }
}

angular.module('cottontail').controller('MainController', MainController);

export default MainController;
