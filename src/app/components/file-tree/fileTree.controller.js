class FileTreeController {
	constructor ($modal, $state, Api, $scope) {
        this.$modal = $modal;
        this.$state = $state;
        this.Api = Api;

        $scope.$on('fileOpened', (event, data) => {
            this.fileOpenedCb({file: data});
        })
	}

    createFile (file) {
	    this.fileAddedCb({file: file});
    }
}

FileTreeController.$inject = ['$modal', '$state', 'Api', '$scope'];


angular.module('cottontail').controller('FileTreeController', FileTreeController);

export default FileTreeController;