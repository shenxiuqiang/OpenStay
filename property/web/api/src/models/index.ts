/* eslint-disable import/no-named-as-default */
import Property from './property.js';
import Room from './room.js';
import Calendar from './calendar.js';
import Booking from './booking.js';

// Define associations
Property.hasMany(Room, {
  foreignKey: 'propertyId',
  as: 'rooms',
  onDelete: 'CASCADE',
});

Room.belongsTo(Property, {
  foreignKey: 'propertyId',
  as: 'property',
});

Room.hasMany(Calendar, {
  foreignKey: 'roomId',
  as: 'calendars',
  onDelete: 'CASCADE',
});

Calendar.belongsTo(Room, {
  foreignKey: 'roomId',
  as: 'room',
});

Room.hasMany(Booking, {
  foreignKey: 'roomId',
  as: 'bookings',
});

Booking.belongsTo(Room, {
  foreignKey: 'roomId',
  as: 'room',
});

Property.hasMany(Booking, {
  foreignKey: 'propertyId',
  as: 'bookings',
});

Booking.belongsTo(Property, {
  foreignKey: 'propertyId',
  as: 'property',
});

export {
  Property,
  Room,
  Calendar,
  Booking,
};

export default {
  Property,
  Room,
  Calendar,
  Booking,
};
