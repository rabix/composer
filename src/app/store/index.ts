import {openFiles, selectedFile} from './workspace.reducer';
import {fileContent, newFile} from './file-cache.reducer';
import {globalErrors} from './errors.reducer';
export const REDUCERS = {openFiles, selectedFile, fileContent, newFile, globalErrors};
