import { DataTypes } from 'sequelize';
import { Migration } from '../migration';

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable('profiles', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    primaryEmail: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    type: {
      allowNull: false,
      type: DataTypes.ENUM('moral', 'fisca'),
    },
    searchable: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
    },
    recommendationsCount: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    subscriber: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
    },
    firstName: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    lastName: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    nickName: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    gender: {
      allowNull: true,
      type: DataTypes.ENUM('male', 'female', 'other'),
    },
    primaryActivity: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    secondaryActivity: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    thirdActivity: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    secondaryEmails: {
      allowNull: true,
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    phoneNumbers: {
      allowNull: true,
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    languages: {
      allowNull: true,
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    externalLinks: {
      allowNull: true,
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    whatsapp: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    imdb: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    facebook: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    instagram: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    vimeo: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    youtube: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    linkedin: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    twitter: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    tiktok: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    headline: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    state: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    city: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    country: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    postalCode: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    university: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    associations: {
      allowNull: true,
      type: DataTypes.TEXT,
    },
    certifications: {
      allowNull: true,
      type: DataTypes.TEXT,
    },
    probono: {
      allowNull: true,
      type: DataTypes.BOOLEAN,
    },
    remote: {
      allowNull: true,
      type: DataTypes.BOOLEAN,
    },
    profilePictureUrl: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    headerPictureUrl: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    birthday: {
      allowNull: true,
      type: DataTypes.DATE,
    },
    workRadius: {
      allowNull: true,
      type: DataTypes.ENUM('local', 'state', 'national', 'international'),
    },
    searchString: {
      allowNull: true,
      type: DataTypes.TSVECTOR,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    deletedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  });
  await sequelize.getQueryInterface().createTable('profile_recommendations', {
    profileId: {
      allowNull: false,
      type: DataTypes.STRING,
      references: { model: 'profiles', key: 'id' },
    },
    recommendedBy: {
      allowNull: false,
      type: DataTypes.STRING,
      references: { model: 'profiles', key: 'id' },
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  });
  await sequelize.getQueryInterface().createTable('accounts', {
    email: {
      allowNull: false,
      primaryKey: true,
      unique: true,
      type: DataTypes.STRING,
    },
    password: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.ENUM('user', 'editor', 'manager', 'admin'),
      allowNull: false,
    },
    passwordRecoveryAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    passwordResetPinExpirationTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    passwordResetPin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ProfileId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: 'profiles', key: 'id' },
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    deletedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().dropTable('profile_recommendations');
  await sequelize.getQueryInterface().dropTable('accounts');
  await sequelize.getQueryInterface().dropTable('profiles');
};
