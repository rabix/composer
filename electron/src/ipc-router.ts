const {ipcMain} = require("electron");
const routes    = require("./routes");

function bindDataRequestListener() {
    ipcMain.on("data-request", (event, request) => {

        // console.log("Request", request.message, request.id, request.data.length);

        const controllerFn = routes[request.message];

        const reply = (id) => (error, data) => {
            if (error) {
                error = Object.assign({}, error, {message: error.message});

                // console.log("Reply", request.id);
                return event.sender.send("data-reply", {id, error});
            }

            event.sender.send("data-reply", {id, data});
        };


        controllerFn(request.data, reply(request.id));
    });
}
module.exports = {
    /**
     * Starts the router event listeners
     * @return {void}
     */
    start: () => {
        bindDataRequestListener();
    },
};
