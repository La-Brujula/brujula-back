import { ServiceError } from './serviceError';

type Meta = {
  total: number;
  limit: number;
  offset: number;
};

export class ServiceResponse<T> {
  public readonly isSuccess: boolean;
  public readonly error: ServiceError | undefined;
  public readonly errorCode?: string;
  public readonly httpStatus: number;
  private readonly entity: T | T[] | undefined;
  private readonly meta?: Meta;

  public constructor(
    isSuccess: boolean,
    httpStatus: number,
    errorMessage?: string | undefined,
    entity?: T | T[],
    errorCode?: string,
    totalItems?: number,
    limit?: number,
    offset?: number
  ) {
    if (isSuccess && errorMessage) {
      throw new Error(
        "InvalidOperation: A result can't be successful if it contains an error"
      );
    }

    if (!isSuccess && !errorMessage) {
      throw new Error(
        'InvalidOperation: A failing result needs to contain an error message'
      );
    }

    this.isSuccess = isSuccess;
    this.httpStatus = httpStatus;
    if (!!errorMessage) {
      this.error = new ServiceError(errorCode || 'EE00', errorMessage);
    }
    this.entity = entity;
    this.errorCode = errorCode || 'EE00';

    if (
      totalItems !== undefined &&
      limit !== undefined &&
      offset !== undefined
    ) {
      this.meta = {
        total: totalItems,
        limit: limit,
        offset: offset,
      };
    }

    Object.freeze(this);
  }

  public static ok<U>(value?: any, status: number = 200): ServiceResponse<U> {
    if (value !== undefined && typeof value.toDTO === 'function') {
      value = value.toDTO();
    }
    return new ServiceResponse<U>(true, status, undefined, value, undefined);
  }

  public static paginate<U>(
    items: U[],
    totalItems: number,
    offset: number,
    limit?: number
  ): ServiceResponse<U[]> {
    return new ServiceResponse<U[]>(
      true,
      200,
      undefined,
      items || [],
      'OK',
      totalItems || 0,
      limit || items.length || 0,
      offset || 0
    );
  }

  public static fail<U>(error: Error, errorCode?: string): ServiceResponse<U> {
    return new ServiceResponse<U>(false, 500, error.name, undefined, errorCode);
  }

  public getValue(): T | T[] | null {
    if (!this.isSuccess) {
      return this.error as T;
    }
    return this.entity ?? null;
  }

  public toJson() {
    return {
      isSuccess: this.isSuccess,
      ...(this.meta && { meta: this.meta }),
      ...(this.isSuccess
        ? {
            entity: this.entity,
          }
        : {
            error: this.error!.toJson(),
          }),
    };
  }
}
