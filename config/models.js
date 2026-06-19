module.exports.models = {
  migrate: 'alter',

  attributes: {
    createdAt: { type: 'number', autoCreatedAt: true },
    updatedAt: { type: 'number', autoUpdatedAt: true },
    id: { type: 'string', columnName: '_id' },
  },

  dataEncryptionKeys: {
    default: 'sAJscaOcu6QsSNaqb0G+T4TEbox64ku9DETFW6ZQWaM=',
  },

  cascadeOnDestroy: true,
};
