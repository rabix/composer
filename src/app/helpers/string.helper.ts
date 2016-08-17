export class StringHelper {
    /**
     * @see StringHelper_dirPathToArrayTest
     */
    public static dirPathToArray(path: string) {
        return path.split('/').filter(x => [".", " ", ""].indexOf(x) === -1);
    }
}
