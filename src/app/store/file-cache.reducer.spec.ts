import {fileContent} from "./file-cache.reducer";
import {it, describe, expect} from "@angular/core/testing";
import {UPDATE_FILE_CONTENT} from "./actions";
import {FileModel} from "./models/fs.models";

describe('File Content Reducer', () => {
   it('should return a new file object', () => {
       let file = FileModel.createFromObject({
           name: 'file1'
       });

       let newState = fileContent(undefined, {
           type: UPDATE_FILE_CONTENT,
           payload: {
               path: 'path/to/file',
               model: file
           }
       });

       expect(newState.model.getName()).toEqual('file1');
   });
});