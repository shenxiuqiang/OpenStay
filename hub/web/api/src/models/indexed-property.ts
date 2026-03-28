/* eslint-disable @typescript-eslint/indent, @typescript-eslint/brace-style */
import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../libs/db.js';

export interface IndexedPropertyAttributes {
  id: string;
  hubId: string;
  propertyId: string;
  propertyDid: string;
  propertyEndpoint: string;
  name: string;
  description: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  coverImageUrl: string | null;
  facilities: string[];
  minPrice: number;
  maxPrice: number;
  currency: string;
  tier: 'basic' | 'pro' | 'premium';
  hubTags: string[];
  isFeatured: boolean;
  syncStatus: 'syncing' | 'synced' | 'error';
  lastSyncAt: Date | null;
  syncCursor: string | null;
  viewCount: number;
  clickCount: number;
  bookingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type IndexedPropertyCreationAttributes = Optional<
  IndexedPropertyAttributes,
  | 'id' | 'description' | 'city' | 'country' | 'latitude' | 'longitude'
  | 'coverImageUrl' | 'minPrice' | 'maxPrice' | 'hubTags' | 'isFeatured'
  | 'syncStatus' | 'lastSyncAt' | 'syncCursor' | 'viewCount' | 'clickCount'
  | 'bookingCount' | 'createdAt' | 'updatedAt'
>;

class IndexedProperty extends Model<IndexedPropertyAttributes, IndexedPropertyCreationAttributes> 
  implements IndexedPropertyAttributes {
  declare id: string;
  declare hubId: string;
  declare propertyId: string;
  declare propertyDid: string;
  declare propertyEndpoint: string;
  declare name: string;
  declare description: string | null;
  declare city: string | null;
  declare country: string | null;
  declare latitude: number | null;
  declare longitude: number | null;
  declare coverImageUrl: string | null;
  declare facilities: string[];
  declare minPrice: number;
  declare maxPrice: number;
  declare currency: string;
  declare tier: 'basic' | 'pro' | 'premium';
  declare hubTags: string[];
  declare isFeatured: boolean;
  declare syncStatus: 'syncing' | 'synced' | 'error';
  declare lastSyncAt: Date | null;
  declare syncCursor: string | null;
  declare viewCount: number;
  declare clickCount: number;
  declare bookingCount: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

IndexedProperty.init(
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    coverImageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    facilities: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    minPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    maxPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'CNY',
    },
    tier: {
      type: DataTypes.ENUM('basic', 'pro', 'premium'),
      allowNull: false,
      defaultValue: 'basic',
    },
    hubTags: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    syncStatus: {
      type: DataTypes.ENUM('syncing', 'synced', 'error'),
      allowNull: false,
      defaultValue: 'syncing',
    },
    lastSyncAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    syncCursor: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    viewCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    clickCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    bookingCount: {
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
    tableName: 'indexed_properties',
    indexes: [
      { fields: ['hubId', 'propertyId'], unique: true },
      { fields: ['hubId'] },
      { fields: ['city'] },
      { fields: ['country'] },
      { fields: ['minPrice'] },
      { fields: ['maxPrice'] },
      { fields: ['tier'] },
      { fields: ['isFeatured'] },
      { fields: ['syncStatus'] },
    ],
  }
);

export default IndexedProperty;
