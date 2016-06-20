import {openFiles, selectedFile, OPEN_FILES_INITIAL_STATE} from "./workspace.reducer";
import {it, describe, expect} from "@angular/core/testing";
import {OPEN_FILE_REQUEST, CLOSE_FILE_REQUEST, SELECT_FILE_REQUEST} from "./actions";
import {FileModel} from "./models/fs.models";

describe('Open Files Reducer', () => {

    it('should initialize', () => {
        let newState = openFiles(undefined, {type: null});
        expect(newState).toEqual(OPEN_FILES_INITIAL_STATE);
    });

    it('should add an opened file to the state', () => {
        let file = new FileModel({
            name: 'test1',
            absolutePath: 'path/to/file'
        });

        let newState = openFiles(undefined, {
            type: OPEN_FILE_REQUEST,
            payload: file
        });

        expect(newState.length).toEqual(1);
        expect(newState.indexOf(file)).toBeGreaterThan(-1);
    });

    it('should not add the same file to the state twice', () => {
        let file = new FileModel({
            name: 'test1',
            absolutePath: 'path/to/file'
        });

        let newState = openFiles(undefined, {
            type: OPEN_FILE_REQUEST,
            payload: file
        });

        newState = openFiles(newState, {
            type: OPEN_FILE_REQUEST,
            payload: file
        });

        expect(newState.length).toEqual(1);
        expect(newState.indexOf(file)).toBeGreaterThan(-1);
    });

    it('should remove a file from open files state', () => {
        let file = new FileModel({
            name: 'test1',
            absolutePath: 'path/to/file'
        });

        let file2 = new FileModel({
            name: 'test2',
            absolutePath: 'path/to/file2'
        });

        let newState = openFiles(undefined, {
            type: OPEN_FILE_REQUEST,
            payload: file
        });

        newState = openFiles(newState, {
            type: OPEN_FILE_REQUEST,
            payload: file2
        });

        expect(newState.length).toEqual(2);

        let newState = openFiles(newState, {
            type: CLOSE_FILE_REQUEST,
            payload: file2
        });

        expect(newState.length).toEqual(1);
        expect(newState.indexOf(file2)).toEqual(-1);
        expect(newState.indexOf(file)).toBeGreaterThan(-1);
    });
});

describe('Selected File Reducer', () => {
   it('should return selected file', () => {
       let file = new FileModel({
           name: 'test1',
           absolutePath: 'path/to/file'
       });

       let newState = selectedFile(undefined, {
           type: SELECT_FILE_REQUEST,
           payload: file
       });

       expect(newState).toEqual(file);
   });
});
