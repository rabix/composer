export class ErrorWrapper {

    constructor(private err: any | string) {

        if (typeof err === "string") {
            this.err = new Error(err);
        }
    }

    toString() {
        if (this.err.error && this.err.error.syscall === "getaddrinfo" && !navigator.onLine) {
            return "You are offline.";
        } else if (this.err.error && this.err.error.message) {
            return this.err.error.message;
        }

        return this.err.message;
    }
}
