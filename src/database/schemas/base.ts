import { CreationOptional, InferAttributes, InferCreationAttributes, Model } from 'sequelize';

export class TimestampModel<
  InferAttributes extends {},
  InferCreationAttributes extends {},
> extends Model<InferAttributes, InferCreationAttributes> {
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
}
