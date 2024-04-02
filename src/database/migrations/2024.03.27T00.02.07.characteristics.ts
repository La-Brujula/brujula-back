import { Migration } from '../migration';

export const up: Migration = async ({ context: sequelize }) => {
  const qi = sequelize.getQueryInterface();
  qi.addColumn('profiles', 'awards', {
    unique: false,
    allowNull: true,
    type: 'text',
  });
  qi.addColumn('profiles', 'biography', {
    unique: false,
    allowNull: true,
    type: 'text',
  });
};
export const down: Migration = async ({ context: sequelize }) => {
  const qi = sequelize.getQueryInterface();
  qi.removeColumn('profiles', 'awards');
  qi.removeColumn('profiles', 'biography');
};
