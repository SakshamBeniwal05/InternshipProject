class apiResponse {
    statusCode: number;
    statuscode: number;
    data: any;
    message: string;

    constructor(statusCode: number, data: any, message: string = "succesful api") {
        this.statusCode = statusCode;
        this.statuscode = statusCode;
        this.data = data;
        this.message = message;
    }
}

export default apiResponse;