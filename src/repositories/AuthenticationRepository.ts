import { Inject, Service } from 'typedi';
import { IAccount, IAuthenticationRequestBody } from '@/models/authentication/authentication';
import Database from '@/database/Database';

@Service('AccountRepository')
export class AccountRepository {
  declare db: Database;
  constructor(@Inject('database') database: Database) {
    this.db = database;
  }

  async findByEmail(email: string): Promise<IAccount | null> {
    return this.db.models.Account.findOne({ where: { email } });
  }

  async create(userInput: IAuthenticationRequestBody): Promise<IAccount> {
    const newUser = { email: userInput.email, password: userInput.password, role: 'user' };
    return this.db.models.Account.create(newUser);
  }

  async delete(email: string): Promise<boolean> {
    return (
      (await this.db.models.Account.destroy({
        where: { email },
      })) == 1
    );
  }
}
