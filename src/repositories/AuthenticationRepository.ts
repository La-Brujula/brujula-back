import { Inject, Service } from 'typedi';
import {
  IAccount,
  IAuthenticationRequestBody,
  IUpdateAccount,
} from '@/models/authentication/authentication';
import Database from '@/database/Database';
import { Repository } from 'sequelize-typescript';
import Account from '@/database/schemas/Account';
import Profile from '@/database/schemas/Profile';
import Logger from '@/providers/Logger';

@Service('AccountRepository')
export class AccountRepository {
  declare accountRepo: Repository<Account>;
  declare profileRepo: Repository<Profile>;
  constructor(@Inject('database') database: Database) {
    this.accountRepo = database.sequelize.getRepository(Account);
    this.profileRepo = database.sequelize.getRepository(Profile);
  }

  async findByEmail(email: string): Promise<IAccount | null> {
    return this.accountRepo.findOne({ where: { email } });
  }

  async create(userInput: IAuthenticationRequestBody): Promise<IAccount> {
    return await this.accountRepo.create(
      {
        email: userInput.email,
        password: userInput.password,
        role: 'user',
        passwordRecoveryAttempts: 0,
        profile: {
          primaryEmail: userInput.email,
          type: userInput.type || 'fisica',
        },
      },
      {
        include: [this.profileRepo],
      }
    );
  }

  async delete(email: string): Promise<boolean> {
    return (
      (await this.accountRepo.destroy({
        where: { email },
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
