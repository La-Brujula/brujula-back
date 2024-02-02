import { IMapper } from '../base/mapper';
import { IAccount, IAccountDTO } from './authentication';

export class AccountMapper implements IMapper<IAccount> {
  static toDto(account: IAccount): IAccountDTO {
    if (!account) {
      throw new Error('Account cannot be null');
    }
    return {
      email: account.email,
      role: account.role,
      ProfileId: account.ProfileId
    };
  }
}
