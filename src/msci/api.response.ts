
export class ApiResponse {
    error: string;
    statusCode: number;
    message: string | null;

    constructor(status: string, err: number, m: string | null) {
        this.error = status;
        this.statusCode = err;
        this.message = m;
    }
}