export class ErrorWrapper {

    constructor(private err: any | string) {

        if (typeof err === "string") {
            this.err = new Error(err);
        }
    }

    toString() {
        if (this.isOffline()) {
            return "You are currently offline - please check your internet connection.";
        }

        if (this.err.error && this.err.error.code === "ENOTFOUND") {
            return "There is a problem with your internet connection.";
        }

        if (this.err.code && this.err.code === "ENOENT") {
            return `No such file or directory: ${this.err.path}`;
        }

        const isHttpRequest = this.err.statusCode && this.err.options;
        if (this.err.error && isHttpRequest) {
            const uri         = this.err.options.uri;
            const timeout     = this.err.options.timeout;
            const justService = uri.split("?")[0];
            const serviceName = justService.charAt(0).toUpperCase() + justService.slice(1);

            const msg = serviceName + " service";

            if (this.err.statusCode === 401) {
                return msg + " says that you are unauthorized to view this resource. Please check your token.";
            }

            // in case app couldn't be found
            if (this.err.statusCode === 404 && this.err.error && this.err.error.code === 6002) {
                return "Either this app doesn't exist or you don't have permission to open it.";
            }

            if (this.err.statusCode === 504) {
                const seconds = timeout / 1000;
                const minutes = seconds / 60;
                const time    = minutes > 1 ? `${minutes} minutes.` : `${seconds} seconds.`;

                return msg + " timed out after " + time;
            }

            if (typeof this.err.error === "string") {
                try {
                    this.err.error = JSON.parse(this.err.error);
                } catch (ex) {
                    console.warn(ex);
                }
            }

            if (this.err.error && this.err.error.message) {
                return this.err.error.message;
            }

            return msg + " failed with " + this.err.message;
        }

        if (this.err.error && this.err.error.message) {
            return this.err.error.message;
        }

        return this.err.message;
    }

    isOffline() {
        return this.err.error && this.err.error.syscall === "getaddrinfo" && !navigator.onLine;
    }
}
