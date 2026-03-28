/* eslint-disable @typescript-eslint/indent, @typescript-eslint/brace-style */
import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../libs/db.js';

export interface RoomAttributes {
  id: string;
  propertyId: string;
  name: string;
  description: string | null;
  area: number | null;
  bedType: string;
  maxGuests: number;
  amenities: string[];
  hasPrivateBathroom: boolean;
  hasAirConditioning: boolean;
  hasHeating: boolean;
  hasWifi: boolean;
  hasTV: boolean;
  basePrice: number;
  currency: string;
  coverImageUrl: string | null;
  imageUrls: string[];
  minNights: number;
  maxNights: number | null;
  cancellationPolicy: 'flexible' | 'moderate' | 'strict';
  sortOrder: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export type RoomCreationAttributes = Optional<
  RoomAttributes,
  'id' | 'description' | 'area' | 'amenities' | 'coverImageUrl' | 
  'imageUrls' | 'maxNights' | 'createdAt' | 'updatedAt'
>;

class Room extends Model<RoomAttributes, RoomCreationAttributes> 
  implements RoomAttributes {
  declare id: string;
  declare propertyId: string;
  declare name: string;
  declare description: string | null;
  declare area: number | null;
  declare bedType: string;
  declare maxGuests: number;
  declare amenities: string[];
  declare hasPrivateBathroom: boolean;
  declare hasAirConditioning: boolean;
  declare hasHeating: boolean;
  declare hasWifi: boolean;
  declare hasTV: boolean;
  declare basePrice: number;
  declare currency: string;
  declare coverImageUrl: string | null;
  declare imageUrls: string[];
  declare minNights: number;
  declare maxNights: number | null;
  declare cancellationPolicy: 'flexible' | 'moderate' | 'strict';
  declare sortOrder: number;
  declare status: 'active' | 'inactive';
  declare createdAt: Date;
  declare updatedAt: Date;
}

Room.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'properties',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    area: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '面积 (平方米)',
    },
    bedType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '大床',
    },
    maxGuests: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2,
    },
    amenities: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    hasPrivateBathroom: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    hasAirConditioning: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    hasHeating: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    hasWifi: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    hasTV: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    basePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'CNY',
    },
    coverImageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    imageUrls: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    minNights: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    maxNights: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    cancellationPolicy: {
      type: DataTypes.ENUM('flexible', 'moderate', 'strict'),
      allowNull: false,
      defaultValue: 'moderate',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
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
    tableName: 'rooms',
    indexes: [
      { fields: ['propertyId'] },
      { fields: ['status'] },
      { fields: ['maxGuests'] },
    ],
  }
);

export default Room;
