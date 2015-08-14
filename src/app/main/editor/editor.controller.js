/**
 * Created by Maya on 10.8.15.
 */

class EditorController {
	constructor() {
		this.tabs = ['file1', 'file2', 'file3'];

		this.code =
`{
	"json": "file"
}`
	}

	load (editor) {
		editor.$blockScrolling = Infinity;
	}
}

angular.module('cottontail').controller('EditorController', EditorController);

export default EditorController;