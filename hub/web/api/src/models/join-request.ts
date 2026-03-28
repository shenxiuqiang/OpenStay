/* eslint-disable @typescript-eslint/indent, @typescript-eslint/brace-style */
import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../libs/db.js';

export interface JoinRequestAttributes {
  id: string;
  hubId: string;
  propertyId: string;
  propertyDid: string;
  propertyEndpoint: string;
  propertyName: string;
  licenseNumber: string | null;
  licenseImageUrl: string | null;
  description: string | null;
  requestedTier: 'basic' | 'pro' | 'premium';
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  reviewedBy: string | null;
  reviewNotes: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type JoinRequestCreationAttributes = Optional<
  JoinRequestAttributes,
  | 'id' | 'licenseNumber' | 'licenseImageUrl' | 'description'
  | 'reviewedBy' | 'reviewNotes' | 'reviewedAt' | 'createdAt' | 'updatedAt'
>;

class JoinRequest extends Model<JoinRequestAttributes, JoinRequestCreationAttributes> 
  implements JoinRequestAttributes {
  declare id: string;
  declare hubId: string;
  declare propertyId: string;
  declare propertyDid: string;
  declare propertyEndpoint: string;
  declare propertyName: string;
  declare licenseNumber: string | null;
  declare licenseImageUrl: string | null;
  declare description: string | null;
  declare requestedTier: 'basic' | 'pro' | 'premium';
  declare status: 'pending' | 'under_review' | 'approved' | 'rejected';
  declare reviewedBy: string | null;
  declare reviewNotes: string | null;
  declare reviewedAt: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

JoinRequest.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    hubId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'hubs',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    propertyId: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    propertyDid: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    propertyEndpoint: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    propertyName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    licenseNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    licenseImageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    requestedTier: {
      type: DataTypes.ENUM('basic', 'pro', 'premium'),
      allowNull: false,
      defaultValue: 'basic',
    },
    status: {
      type: DataTypes.ENUM('pending', 'under_review', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
    reviewedBy: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    reviewNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'join_requests',
    indexes: [
      { fields: ['hubId'] },
      { fields: ['propertyId'] },
      { fields: ['status'] },
      { fields: ['propertyDid'] },
    ],
  }
);

export default JoinRequest;
