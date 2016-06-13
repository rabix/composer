export class FileHelper {

    public static relativeToAbsolutePath(relativePath: string, basePath: string): string {
       let stack = basePath.split("/"),
           parts = relativePath.split("/");
       stack.pop(); // remove current file name (or empty string)
                    // (omit if "base" is the current folder without trailing slash)
       for (let i=0; i<parts.length; i++) {
           if (parts[i] == ".")
               continue;
           if (parts[i] == "..")
               stack.pop();
           else
               stack.push(parts[i]);
       }

       return stack.join("/");
    }
    
    public static isRelativePath(path: string): boolean {
        let firstTwoCharacters = path.slice(0,2);
        let firstThreeCharacters = path.slice(0,3);

        return (firstTwoCharacters === './' || firstThreeCharacters === '../');
    }
}
