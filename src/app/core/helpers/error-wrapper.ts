export class ErrorWrapper {

    constructor(private err: any | string) {

        if (typeof err === "string") {
            this.err = new Error(err);
        }
    }

    toString() {
        if (this.err.error && this.err.error.syscall === "getaddrinfo" && !navigator.onLine) {
            return "You are offline.";
        }

        const isHttpRequest = this.err.statusCode && this.err.options;
        if (this.err.error && isHttpRequest) {
            const uri         = this.err.options.uri;
            const timeout     = this.err.options.timeout;
            const justService = uri.split("?")[0];
            const serviceName = justService.charAt(0).toUpperCase() + justService.slice(1);

            let msg = serviceName + " service";

            if (this.err.statusCode === 401) {
                return msg + " says that you are unauthorized to view this resource. Please check your token.";
            }

            if (this.err.statusCode === 504) {
                const seconds = timeout / 1000;
                const minutes = seconds / 60;
                const time    = minutes > 1 ? `${minutes} minutes.` : `${seconds} seconds.`;

                return msg + " timed out after " + time;
            }

            return msg + " failed with " + this.err.message;
        }

        if (this.err.error && this.err.error.message) {
            return this.err.error.message;
        }

        return this.err.message;
    }
}
