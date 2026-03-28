/* eslint-disable import/no-named-as-default */
import Hub from './hub.js';
import JoinRequest from './join-request.js';
import IndexedProperty from './indexed-property.js';

// Define associations
Hub.hasMany(JoinRequest, {
  foreignKey: 'hubId',
  as: 'joinRequests',
  onDelete: 'CASCADE',
});

JoinRequest.belongsTo(Hub, {
  foreignKey: 'hubId',
  as: 'hub',
});

Hub.hasMany(IndexedProperty, {
  foreignKey: 'hubId',
  as: 'indexedProperties',
  onDelete: 'CASCADE',
});

IndexedProperty.belongsTo(Hub, {
  foreignKey: 'hubId',
  as: 'hub',
});

export {
  Hub,
  JoinRequest,
  IndexedProperty,
};

export default {
  Hub,
  JoinRequest,
  IndexedProperty,
};
