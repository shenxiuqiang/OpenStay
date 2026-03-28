/* eslint-disable @typescript-eslint/indent, @typescript-eslint/brace-style */
import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../libs/db.js';

export interface PropertyAttributes {
  id: string;
  did: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  checkInTime: string;
  checkOutTime: string;
  facilities: string[];
  languages: string[];
  licenseNumber: string | null;
  licenseImage: string | null;
  nodeNftAddress: string | null;
  nodeNftTokenId: string | null;
  theme: string;
  customCss: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  status: 'active' | 'inactive' | 'suspended';
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PropertyCreationAttributes = Optional<
  PropertyAttributes,
  'id' | 'description' | 'address' | 'city' | 'country' | 
  'latitude' | 'longitude' | 'phone' | 'email' | 'website' |
  'licenseNumber' | 'licenseImage' | 'nodeNftAddress' | 'nodeNftTokenId' |
  'customCss' | 'logoUrl' | 'coverImageUrl' | 'createdAt' | 'updatedAt'
>;

class Property extends Model<PropertyAttributes, PropertyCreationAttributes> 
  implements PropertyAttributes {
  declare id: string;
  declare did: string;
  declare name: string;
  declare slug: string;
  declare description: string | null;
  declare address: string | null;
  declare city: string | null;
  declare country: string | null;
  declare latitude: number | null;
  declare longitude: number | null;
  declare phone: string | null;
  declare email: string | null;
  declare website: string | null;
  declare checkInTime: string;
  declare checkOutTime: string;
  declare facilities: string[];
  declare languages: string[];
  declare licenseNumber: string | null;
  declare licenseImage: string | null;
  declare nodeNftAddress: string | null;
  declare nodeNftTokenId: string | null;
  declare theme: string;
  declare customCss: string | null;
  declare logoUrl: string | null;
  declare coverImageUrl: string | null;
  declare status: 'active' | 'inactive' | 'suspended';
  declare isPublic: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Property.init(
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
    address: {
      type: DataTypes.STRING(500),
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
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    checkInTime: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: '14:00',
    },
    checkOutTime: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: '12:00',
    },
    facilities: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    languages: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ['zh'],
    },
    licenseNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    licenseImage: {
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
    theme: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'default',
    },
    customCss: {
      type: DataTypes.TEXT,
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
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      allowNull: false,
      defaultValue: 'active',
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: 'properties',
    indexes: [
      { fields: ['did'], unique: true },
      { fields: ['slug'], unique: true },
      { fields: ['city'] },
      { fields: ['country'] },
      { fields: ['status'] },
    ],
  }
);

export default Property;
