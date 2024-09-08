import { Migration } from '../migration';

export const up: Migration = async ({ context: sequelize }) => {
  const qi = sequelize.getQueryInterface();
  qi.addColumn('accounts', 'emailVerificationPinExpirationTime', {
    unique: false,
    allowNull: true,
    type: 'date',
  });
  qi.addColumn('accounts', 'emailVerificationPin', {
    unique: false,
    allowNull: true,
    type: 'text',
  });
  qi.addColumn('profiles', 'verified', {
    unique: false,
    allowNull: false,
    defaultValue: false,
    type: 'bool',
  });
};
export const down: Migration = async ({ context: sequelize }) => {
  const qi = sequelize.getQueryInterface();
  qi.removeColumn('accounts', 'emailVerificationPinExpirationTime');
  qi.removeColumn('accounts', 'emailVerificationPin');
  qi.removeColumn('profiles', 'verified');
};
