/* eslint-disable @typescript-eslint/indent, @typescript-eslint/brace-style */
import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../libs/db.js';

export interface HubAttributes {
  id: string;
  did: string;
  name: string;
  slug: string;
  description: string | null;
  region: string | null;
  category: string | null;
  languages: string[];
  website: string | null;
  email: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  nodeNftAddress: string | null;
  nodeNftTokenId: string | null;
  pricingBasicMonthly: number;
  pricingBasicYearly: number;
  pricingProMonthly: number;
  pricingProYearly: number;
  pricingPremiumMonthly: number;
  pricingPremiumYearly: number;
  defaultCommissionRate: number;
  status: 'active' | 'inactive';
  propertyCount: number;
  totalBookings: number;
  createdAt: Date;
  updatedAt: Date;
}

export type HubCreationAttributes = Optional<
  HubAttributes,
  | 'id' | 'description' | 'region' | 'category' | 'website' | 'email'
  | 'logoUrl' | 'coverImageUrl' | 'nodeNftAddress' | 'nodeNftTokenId'
  | 'propertyCount' | 'totalBookings' | 'createdAt' | 'updatedAt'
>;

class Hub extends Model<HubAttributes, HubCreationAttributes> 
  implements HubAttributes {
  declare id: string;
  declare did: string;
  declare name: string;
  declare slug: string;
  declare description: string | null;
  declare region: string | null;
  declare category: string | null;
  declare languages: string[];
  declare website: string | null;
  declare email: string | null;
  declare logoUrl: string | null;
  declare coverImageUrl: string | null;
  declare nodeNftAddress: string | null;
  declare nodeNftTokenId: string | null;
  declare pricingBasicMonthly: number;
  declare pricingBasicYearly: number;
  declare pricingProMonthly: number;
  declare pricingProYearly: number;
  declare pricingPremiumMonthly: number;
  declare pricingPremiumYearly: number;
  declare defaultCommissionRate: number;
  declare status: 'active' | 'inactive';
  declare propertyCount: number;
  declare totalBookings: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Hub.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    did: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    region: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    languages: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ['zh'],
    },
    website: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    logoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    coverImageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    nodeNftAddress: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    nodeNftTokenId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    pricingBasicMonthly: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 99,
    },
    pricingBasicYearly: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 999,
    },
    pricingProMonthly: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 299,
    },
    pricingProYearly: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 2999,
    },
    pricingPremiumMonthly: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 999,
    },
    pricingPremiumYearly: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 9999,
    },
    defaultCommissionRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 10,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    },
    propertyCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    totalBookings: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    tableName: 'hubs',
    indexes: [
      { fields: ['did'], unique: true },
      { fields: ['slug'], unique: true },
      { fields: ['status'] },
      { fields: ['region'] },
      { fields: ['category'] },
    ],
  }
);

export default Hub;
