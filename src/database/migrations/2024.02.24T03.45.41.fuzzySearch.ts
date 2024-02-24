import { Migration } from '../migration';

export const up: Migration = async ({ context: sequelize }) => {
  sequelize.query('CREATE EXTENSION fuzzystrmatch;');
  sequelize.query('CREATE EXTENSION pg_trgm;');
  sequelize
    .getQueryInterface()
    .changeColumn('profiles', 'searchString', 'TEXT');
  sequelize.getQueryInterface().changeColumn('profiles', 'primaryEmail', {
    unique: true,
    allowNull: false,
    type: 'varchar(255)',
  });
  sequelize.getQueryInterface().addConstraint('profiles', {
    type: 'unique',
    fields: ['primaryEmail'],
    name: 'profiles_primaryEmail_unique',
  });
};
export const down: Migration = async ({ context: sequelize }) => {
  sequelize.query('DROP EXTENSION fuzzystrmatch;');
  sequelize.query('DROP EXTENSION pg_trgm;');
  sequelize
    .getQueryInterface()
    .changeColumn('profiles', 'searchString', 'TSVECTOR');
  sequelize.getQueryInterface().changeColumn('profiles', 'primaryEmail', {
    unique: false,
    allowNull: false,
    type: 'varchar(255)',
  });
  sequelize
    .getQueryInterface()
    .removeConstraint('profiles', 'profiles_primaryEmail_fkey');
};
