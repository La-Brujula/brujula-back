export class ServiceError extends Error {
  declare errorCode: string;
  declare httpCode: number;

  constructor(code: string, message: string, httpStatus: number = 400) {
    super(message);
    this.errorCode = code;
    this.httpCode = httpStatus;
  }
}
