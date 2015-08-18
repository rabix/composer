import * as fileModel from '../models/file.model';

class NewFile {
    constructor(name, type, content) {
        if (type.indexOf('.') === 0) {
            type = type.substring(1);
        }
        return new fileModel[type.toUpperCase()](name, content || '');
    }
}

angular.module('cottontail').factory('NewFile', NewFile);

export default NewFile;