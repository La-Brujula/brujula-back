export class ServiceError extends Error {
  declare errorCode: string;
  declare httpCode: number;

  constructor(code: string, message: string, httpStatus: number = 400) {
    super(message);
    this.errorCode = code;
    this.httpCode = httpStatus;
  }

  static internalError(reason: string) {
    return new ServiceError('EE00', reason, 500);
  }

  public toJson() {
    return {
      errorCode: this.errorCode,
      message: this.message,
    };
  }
}
