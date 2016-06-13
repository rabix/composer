import {fileContent, newFile} from "./file-cache.reducer";
import {it, describe, expect} from "@angular/core/testing";
import {UPDATE_FILE_CONTENT, NEW_FILE_CREATED} from "./actions";
import {FileModel} from "./models/fs.models";

describe('File Content Reducer', () => {
   it('should return a file model', () => {
       let file = new FileModel({name: "file1"});

       let newState = fileContent(undefined, {
           type: UPDATE_FILE_CONTENT,
           payload: {
               path: 'path/to/file',
               model: file
           }
       });

       expect(newState.model.name).toEqual('file1');
   });
});

describe('New File Reducer', () => {
    it('should return newly created file model', () => {
        let file = new FileModel({name: "file1"});

        let newState = newFile(undefined, {
            type: NEW_FILE_CREATED,
            payload: {
                path: 'path/to/file',
                model: file
            }
        });

        expect(newState.model instanceof FileModel).toEqual(true);
        expect(newState.model.name).toEqual('file1');
    });
});
