import { Migration } from '../migration';

export const up: Migration = async ({ context: sequelize }) => {
  const qi = sequelize.getQueryInterface();
  qi.addColumn('accounts', 'referal', {
    unique: false,
    allowNull: true,
    type: 'text',
  });
};
export const down: Migration = async ({ context: sequelize }) => {
  const qi = sequelize.getQueryInterface();
  qi.removeColumn('accounts', 'referal');
};
