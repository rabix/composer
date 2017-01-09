const glob = require("glob");
const Application = require("spectron").Application;

function boot() {
    const searchPath = process.cwd() + "/build/**/rabix-editor";

    return new Promise((resolve, reject) => {

        glob(searchPath, (err, files) => {

            if (err) throw err;

            if (!files.length) throw new Error(`
                No packaged apps found in “${searchPath}”. 
                Did you forget to build the app? 
                (hint: “npm run build:electron”)
            `);

            const app = new Application({path: files[0]});

            app.start().then(resolve, reject);
        });
    });
}

function shutdown(app) {

    return new Promise((resolve, reject) => {

        (app && app.isRunning()) ? app.stop().then(resolve, reject) : reject();

    });
}

module.exports = {boot, shutdown};
