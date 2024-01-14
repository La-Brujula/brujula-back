import { ServiceError } from './serviceError';

export class ServiceResponse<T> {
  public readonly isSuccess: boolean;
  public readonly error: ServiceError | undefined;
  public readonly errorCode: string;
  public readonly httpStatus: number;
  private readonly entity: T | undefined;

  public constructor(
    isSuccess: boolean,
    httpStatus: number,
    errorMessage?: string | undefined,
    entity?: T,
    errorCode?: string
  ) {
    if (isSuccess && errorMessage) {
      throw new Error("InvalidOperation: A result can't be successful if it contains an error");
    }

    if (!isSuccess && !errorMessage) {
      throw new Error('InvalidOperation: A failing result needs to contain an error message');
    }

    this.isSuccess = isSuccess;
    this.httpStatus = httpStatus;
    if (!!errorMessage && errorCode) {
      this.error = new ServiceError(errorCode, errorMessage);
    }
    this.entity = entity;
    this.errorCode = !errorCode || errorCode == '' ? 'E00' : errorCode;

    Object.freeze(this);
  }

  public static ok<U>(value: any): ServiceResponse<U> {
    console.log(value['toDTO']);

    if (typeof value['toDTO'] === 'function') {
      value = value.toDTO();
    }
    return new ServiceResponse<U>(true, 200, undefined, value, 'OK');
  }

  public static fail<U>(error: Error, errorCode?: string): ServiceResponse<U> {
    return new ServiceResponse<U>(false, 500, error.message, undefined, errorCode);
  }

  public getValue(): T | null {
    if (!this.isSuccess) {
      return this.error as T;
    }
    return this.entity ?? null;
  }

  public toJson() {
    return {
      isSuccess: this.isSuccess,
      ...(this.isSuccess
        ? {
            entity: this.entity,
          }
        : {
            error: this.error,
            errorCode: this.errorCode,
          }),
    };
  }
}
