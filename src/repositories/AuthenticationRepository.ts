import { Inject, Service } from 'typedi';
import {
  IAccount,
  ISignupRequestBody,
  IUpdateAccount,
} from '@/models/authentication/authentication';
import Database from '@/database/Database';
import { Repository } from 'sequelize-typescript';
import Account from '@/database/schemas/Account';
import Profile from '@/database/schemas/Profile';

@Service('AccountRepository')
export class AccountRepository {
  declare accountRepo: Repository<Account>;
  declare profileRepo: Repository<Profile>;
  constructor(@Inject('database') database: Database) {
    this.accountRepo = database.sequelize.getRepository(Account);
    this.profileRepo = database.sequelize.getRepository(Profile);
  }

  async findByEmail(email: string) {
    return this.accountRepo.findOne({ where: { email } });
  }

  async create(
    userInput: ISignupRequestBody,
    profile: Profile | null
  ): Promise<IAccount> {
    return this.accountRepo.create({
      email: userInput.email,
      password: userInput.password,
      role: 'user',
      passwordRecoveryAttempts: 0,
      ProfileId: profile?.id,
      referal: userInput.referal,
    });
  }

  async delete(email: string): Promise<boolean> {
    return (
      (await this.accountRepo.destroy({
        where: { email },
        force: true,
      })) == 1
    );
  }

  async update(email: string, values: IUpdateAccount) {
    return await this.accountRepo.update(values, {
      where: {
        email,
      },
    });
  }
}
