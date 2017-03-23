"use strict";
const fsController = require("./fs.controller");
function isLocalFile(path) {
    return path.startsWith("/");
}
function isURL(path) {
    return path.startsWith("http");
}
function get(filePath, callback) {
    /**
     * If this is a local file, we can just try to read it and return the content
     */
    if (isLocalFile(filePath)) {
        return fsController.readFileContent(filePath, callback);
    }
    /**
     * If it's an url, we need to check first if we can fetch it
     */
    if (isURL) {
    }
}
exports.get = get;
function search(term, config = {}, callback) {
}
exports.search = search;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS5jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbnRyb2xsZXJzL2ZpbGUuY29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsZ0RBQWlEO0FBR2pELHFCQUFxQixJQUFJO0lBQ3JCLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFFRCxlQUFlLElBQUk7SUFDZixNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNuQyxDQUFDO0FBRUQsYUFBb0IsUUFBUSxFQUFFLFFBQVE7SUFDbEM7O09BRUc7SUFDSCxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hCLE1BQU0sQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBRVosQ0FBQztBQUNMLENBQUM7QUFkRCxrQkFjQztBQUVELGdCQUF1QixJQUFJLEVBQUUsTUFBTSxHQUFHLEVBQUUsRUFBRSxRQUFRO0FBRWxELENBQUM7QUFGRCx3QkFFQyJ9