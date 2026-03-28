/* eslint-disable @typescript-eslint/indent, @typescript-eslint/brace-style */
import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../libs/db.js';

export interface CalendarAttributes {
  id: string;
  roomId: string;
  date: Date;
  status: 'available' | 'booked' | 'blocked' | 'maintenance';
  price: number | null;
  currency: string;
  availableCount: number;
  minNights: number | null;
  maxNights: number | null;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CalendarCreationAttributes = Optional<
  CalendarAttributes,
  'id' | 'price' | 'availableCount' | 'minNights' | 'maxNights' | 'note' | 'createdAt' | 'updatedAt'
>;

class Calendar extends Model<CalendarAttributes, CalendarCreationAttributes> 
  implements CalendarAttributes {
  declare id: string;
  declare roomId: string;
  declare date: Date;
  declare status: 'available' | 'booked' | 'blocked' | 'maintenance';
  declare price: number | null;
  declare currency: string;
  declare availableCount: number;
  declare minNights: number | null;
  declare maxNights: number | null;
  declare note: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Calendar.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    roomId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'rooms',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('available', 'booked', 'blocked', 'maintenance'),
      allowNull: false,
      defaultValue: 'available',
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: '当日特殊价格，null 表示使用房型基础价格',
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'CNY',
    },
    availableCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    minNights: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    maxNights: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING(500),
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
    tableName: 'calendars',
    indexes: [
      { fields: ['roomId', 'date'], unique: true },
      { fields: ['status'] },
      { fields: ['date'] },
    ],
  }
);

export default Calendar;
