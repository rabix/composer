export class ModalErrorHandler {
    handleError(error: Error) {
        debugger;

        console.log("Got an error to handle", error);
        console.error(error);
    }
}
