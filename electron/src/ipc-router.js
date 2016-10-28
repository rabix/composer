const {ipcMain} = require("electron");
const routes = require("./routes");

ipcMain.on("data-request", (event, request) => {

    const controllerFn = routes[request.message];

    const reply = (id) => (error, data) => {
        if (error) {
            error = Object.assign({}, error, {message: error.message});
            return event.sender.send("data-reply", {id, error});
        }

        event.sender.send("data-reply", {id, data});
    };

    controllerFn(request.data, reply(request.id));
});