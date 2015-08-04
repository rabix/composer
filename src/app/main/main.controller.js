class MainController {
    constructor($timeout, toastr) {
        'ngInject';

        this.awesomeThings = [];
        this.classAnimation = '';
        this.creationDate = 1437570111495;
        this.toastr = toastr;

    }

    showToastr() {
        this.toastr.info('Fork <a href="https://github.com/Swiip/generator-gulp-angular" target="_blank"><b>generator-gulp-angular</b></a>');
        this.classAnimation = '';
    }
}

angular.module('cottontail').controller('MainController', MainController);

export default MainController;
