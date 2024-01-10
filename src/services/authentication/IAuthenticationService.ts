import {
  IAuthenticationRequestBody,
  IAuthenticationResponseBody,
  IAccountDTO,
  IResetPasswordRequestBody,
} from '@/models/authentication/authentication';
import { ServiceResponse } from '@/shared/classes/serviceResponse';

export default interface IAuthenticationService {
  create(
    newAccount: IAuthenticationRequestBody
  ): Promise<ServiceResponse<IAuthenticationResponseBody>>;
  signIn(
    userInput: IAuthenticationRequestBody
  ): Promise<ServiceResponse<IAuthenticationResponseBody>>;
  logOut(): Promise<ServiceResponse<undefined>>;
  getAccount(id: string): Promise<ServiceResponse<IAccountDTO>>;
  generatePasswordRecoveryPin(email: string): Promise<ServiceResponse<undefined>>;
  updatePassword(passwordRequest: IResetPasswordRequestBody): Promise<ServiceResponse<IAccountDTO>>;
}
