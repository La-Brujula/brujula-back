import { Inject, Service } from 'typedi';
import {
  IAccount,
  ISignupRequestBody,
  IUpdateAccount,
} from '@/models/authentication/authentication';
import Database from '@/database/Database';
import { getIndexes, Repository } from 'sequelize-typescript';
import Account from '@/database/schemas/Account';
import Profile from '@/database/schemas/Profile';
import { Op, Transaction, WhereOptions } from 'sequelize';

@Service('AccountRepository')
export class AccountRepository {
  declare accountRepo: Repository<Account>;
  declare profileRepo: Repository<Profile>;
  constructor(@Inject('database') database: Database) {
    this.accountRepo = database.sequelize.getRepository(Account);
    this.profileRepo = database.sequelize.getRepository(Profile);
  }

  async getUsersToAlertOfOpening(params: {
    activity: string;
    country?: string;
    city?: string;
    state?: string;
    remote?: boolean;
    probono?: boolean;
    gender?: string;
  }): Promise<Profile[]> {
    const { activity, country, city, state, remote, probono, gender } = params;

    return await this.profileRepo.findAll({
      where: {
        [Op.and]: [
          !!activity && {
            [Op.or]: [
              { primaryActivity: activity },
              { secondaryActivity: activity },
              { thirdActivity: activity },
            ],
          },
          !!country && { country },
          !!city && { city },
          !!state && { state },
          !!remote && { remote },
          !!probono && { probono },
          !!gender && { gender },
        ].filter((v) => v !== false) as WhereOptions<Profile>,
      },
      attributes: ['id', 'whatsapp', 'phoneNumbers'],
      include: [
        {
          model: this.accountRepo,
          as: 'account',
          required: true,
          where: {
            jobNotifications: true,
          },
          attributes: ['contactMethod', 'email'],
        },
      ],
    });
  }

  async existsByEmail(email: string, transaction?: Transaction) {
    return this.accountRepo.findOne({
      where: { email },
      transaction,
      attributes: ['email'],
    });
  }
  async findByEmail(email: string, transaction?: Transaction) {
    return this.accountRepo.findOne({ where: { email }, transaction });
  }
  async findByVerificationCode(pin: string, transaction?: Transaction) {
    return this.accountRepo.findOne({
      where: {
        emailVerificationPin: pin,
      },
      transaction,
    });
  }

  async create(
    userInput: ISignupRequestBody,
    profile: Profile | null,
    transaction?: Transaction
  ): Promise<IAccount> {
    return this.accountRepo.create(
      {
        email: userInput.email,
        password: userInput.password,
        role: 'user',
        passwordRecoveryAttempts: 0,
        ProfileId: profile?.id,
        referal: userInput.referal,
      },
      { transaction }
    );
  }

  async delete(email: string, transaction?: Transaction): Promise<boolean> {
    return (
      (await this.accountRepo.destroy({
        where: { email },
        force: true,
        transaction,
      })) == 1
    );
  }

  async update(
    email: string,
    values: Partial<IUpdateAccount>,
    transaction?: Transaction
  ) {
    return await this.accountRepo.update(values, {
      where: {
        email,
      },
      transaction,
    });
  }
}
