/* eslint-disable @typescript-eslint/indent, @typescript-eslint/brace-style */
import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../libs/db.js';

export interface BookingAttributes {
  id: string;
  bookingNumber: string;
  roomId: string;
  propertyId: string;
  guestDid: string | null;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  guestCount: number;
  checkInDate: Date;
  checkOutDate: Date;
  nights: number;
  roomPrice: number;
  taxes: number;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'refunded';
  paymentMethod: string | null;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentTransactionId: string | null;
  specialRequests: string | null;
  source: 'direct' | 'hub';
  hubId: string | null;
  confirmedAt: Date | null;
  checkedInAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingCreationAttributes = Optional<
  BookingAttributes,
  'id' | 'guestDid' | 'guestPhone' | 'taxes' | 'paymentMethod' | 
  'paymentTransactionId' | 'specialRequests' | 'hubId' |
  'confirmedAt' | 'checkedInAt' | 'completedAt' | 'cancelledAt' | 'createdAt' | 'updatedAt'
>;

class Booking extends Model<BookingAttributes, BookingCreationAttributes> 
  implements BookingAttributes {
  declare id: string;
  declare bookingNumber: string;
  declare roomId: string;
  declare propertyId: string;
  declare guestDid: string | null;
  declare guestName: string;
  declare guestEmail: string;
  declare guestPhone: string | null;
  declare guestCount: number;
  declare checkInDate: Date;
  declare checkOutDate: Date;
  declare nights: number;
  declare roomPrice: number;
  declare taxes: number;
  declare totalAmount: number;
  declare currency: string;
  declare status: 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'refunded';
  declare paymentMethod: string | null;
  declare paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  declare paymentTransactionId: string | null;
  declare specialRequests: string | null;
  declare source: 'direct' | 'hub';
  declare hubId: string | null;
  declare confirmedAt: Date | null;
  declare checkedInAt: Date | null;
  declare completedAt: Date | null;
  declare cancelledAt: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Booking.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    bookingNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    roomId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'rooms',
        key: 'id',
      },
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'properties',
        key: 'id',
      },
    },
    guestDid: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    guestName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    guestEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    guestPhone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    guestCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    checkInDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    checkOutDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    nights: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    roomPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    taxes: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'CNY',
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'refunded', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    paymentTransactionId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    specialRequests: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    source: {
      type: DataTypes.ENUM('direct', 'hub'),
      allowNull: false,
      defaultValue: 'direct',
    },
    hubId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    confirmedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    checkedInAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancelledAt: {
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
    tableName: 'bookings',
    indexes: [
      { fields: ['bookingNumber'], unique: true },
      { fields: ['propertyId'] },
      { fields: ['roomId'] },
      { fields: ['guestDid'] },
      { fields: ['status'] },
      { fields: ['checkInDate'] },
    ],
  }
);

export default Booking;
