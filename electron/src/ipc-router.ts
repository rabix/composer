import * as events from "events";

const {ipcMain} = require("electron");
const routes    = require("./routes");
type RouteController = (data: any,
                        dataCallback: (err?: Error, data?: any) => void,
                        emitter?: events.EventEmitter) => {};

const activeChannels: { [messageID: string]: events.EventEmitter } = {};

function bindDataRequestListener() {
    /**
     * React to “data-request” events incoming from the IPC channel.
     * @see IpcService.request
     * @see IpcService.watch
     */
    ipcMain.on("data-request", (event, request) => {

        // console.log("Request", request.message, request.id, request.data.length);

        /**
         * Message should be mapped to a route name (controller function)
         * Take the function that should be executed.
         */
        const controllerFn = routes[request.message] as RouteController;

        /**
         * We need to create a callback for the controller. That callback will take incoming errors and responses
         * and attach the ID of the original message, pack it, and send it downstream, so {@link IpcService} can link the
         * message on the IPC channel to the open request.
         */
        const reply = (id: string) => (error?: Error, data?: any) => {
            if (error) {
                error = Object.assign({}, error, {message: error.message});

                // console.log("Reply", request.id);
                event.sender.send("data-reply", {id, error});
                return;
            }

            event.sender.send("data-reply", {id, data});
        };

        // If this requests accepts data over time, both client and server need to be able to terminate
        // the connection
        if (request.watch) {
            const emitter = new events.EventEmitter();

            activeChannels[request.id] = emitter;

            controllerFn(request.data, reply(request.id), emitter);

            emitter.on("stop", () => {
                delete activeChannels[request.id];
            });

        } else {
            controllerFn(request.data, reply(request.id));
        }


    });

    /**
     * If client stops listening, we should cancel pending processes and remove the event emitter.
     */
    ipcMain.on("data-request-terminate", (event, request) => {

        if (request.message === "stop" && activeChannels[request.id]) {
            activeChannels[request.id].emit("stop");
        }
    });
}

module.exports = {
    /**
     * Starts the router event listeners
     * @return {void}
     */
    start: () => {
        routes.loadDataRepository();
        bindDataRequestListener();
    },
};
