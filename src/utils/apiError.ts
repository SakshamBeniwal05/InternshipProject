class apiError extends Error {
    statusCode: number;
    statuscode: number;
    error: any[];
    errors: any[];

    constructor(statusCode: number, message: string = "something went wrong", error: any[] = [], stack: string = "") {
        super(message);
        this.statusCode = statusCode;
        this.statuscode = statusCode;
        this.error = error;
        this.errors = error;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
export default apiError;