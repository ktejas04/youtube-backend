class ApiResponse{
    constructor(statusCode, data, message="true"){
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
        //setting standard for ourselves, as code greater than 400 is used for error messages
    }
}