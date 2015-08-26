class FileTreeController {
	constructor ($modal, $state, Api) {
        this.$modal = $modal;
        this.$state = $state;
        this.Api = Api;
	}

    createFile (file) {
	    this.fileAddedCb({file: file});
    }

    openFile(file) {
        this.fileOpenedCb({file: file});
    }
}

FileTreeController.$inject = ['$modal', '$state', 'Api'];


angular.module('cottontail').controller('FileTreeController', FileTreeController);

export default FileTreeController;