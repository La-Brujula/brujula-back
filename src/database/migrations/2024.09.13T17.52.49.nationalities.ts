import { Migration } from '../migration';

export const up: Migration = async ({ context: sequelize }) => {
  const qi = sequelize.getQueryInterface();
  qi.addColumn('profiles', 'companyName', {
    unique: false,
    allowNull: true,
    type: 'text',
  });
  qi.addColumn('profiles', 'jobTitle', {
    unique: false,
    allowNull: true,
    type: 'text',
  });
  qi.addColumn('profiles', 'nationality', {
    unique: false,
    allowNull: true,
    type: 'text',
  });
};
export const down: Migration = async ({ context: sequelize }) => {
  const qi = sequelize.getQueryInterface();
  qi.removeColumn('profiles', 'companyName');
  qi.removeColumn('profiles', 'jobTitle');
  qi.removeColumn('profiles', 'nationality');
};
