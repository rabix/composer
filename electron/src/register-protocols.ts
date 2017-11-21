import * as fs from "fs";
import * as os from "os";

function registerProtocolForLinux() {

    const desktopFilePath = os.homedir() + "/.local/share/applications/appimagekit-rabix-composer.desktop";

    const configMimeFilePath = os.homedir() + "/.config/mimeapps.list";
    const localMimeFilePath = os.homedir() + "/.local/share/applications/mimeapps.list";

    const xSchemeHandler = "x-scheme-handler/rabix-composer";

    // Read desktop file (appimagekit-rabix-composer.desktop)
    fs.readFile(desktopFilePath, "utf8", (err, data) => {

        if (err) {
            return;
        }

        const hasMimeType = ~data.indexOf("MimeType=");

        // If there is no MimeType already set (first time starting application)
        if (!hasMimeType) {

            // Append MimeType=x-scheme-handler/rabix-composer handler to the end of a file
            fs.appendFile(desktopFilePath, "MimeType=" + xSchemeHandler, () => {
            });
        }

        // Open .config/mimeapps.list file
        fs.readFile(configMimeFilePath, "utf8", (err, configMimeFileContent) => {

            if (err) {
                // In case .config/mimeapps.list file does not exist, open .local/share/applications/mimeapps.list file
                fs.readFile(localMimeFilePath, "utf8", (err, localMimeFileContent) => {

                    if (err) {
                        return;
                    }
                    // Update .config/mimeapps.list with rabix-composer x-scheme-handler
                    updateMimeAppsListFile(localMimeFileContent, localMimeFilePath)
                });

                return;
            }
            // Update .local/share/applications/mimeapps.list with rabix-composer x-scheme-handler
            updateMimeAppsListFile(configMimeFileContent, configMimeFilePath);

        });

    });
}

function updateMimeAppsListFile(data, path) {
    const xSchemeHandler = "x-scheme-handler/rabix-composer=appimagekit-rabix-composer.desktop";

    const fileHasSchemeHandler = ~data.indexOf(xSchemeHandler);

    if (!fileHasSchemeHandler) {

        const dataToWrite = data.replace(/(\[Default Applications\]|\[Added Associations\])/g, "$1\n" + xSchemeHandler);

        fs.writeFile(path, dataToWrite, () => {
        });
    }
}

module.exports = {
    registerProtocolForLinux
}
