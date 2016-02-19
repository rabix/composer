import * as fileModel from '../models/file.model';

class NewFile {
    constructor(name, type, content, path) {
        if (type.indexOf('.') === 0) {
            type = type.substring(1);
        }
        let modelType = 'TXT';
        if (fileModel[type.toUpperCase()]) {
            modelType = type.toUpperCase();
        }
        return new fileModel[modelType](name, content || '', path);
    }
}

angular.module('cottontail').factory('NewFile', NewFile);

export default NewFile;