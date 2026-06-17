module.exports = {
  attributes: {
    type: {
      type: 'string',
      isIn: ['transfer', 'deposit', 'withdraw'],
      required: true,
    },
    fromPocket: {
      model: 'pocket',
    },
    toPocket: {
      model: 'pocket',
    },
    amount: {
      type: 'number',
      required: true,
    },
    status: {
      type: 'string',
      isIn: ['pending', 'success', 'failed'],
      defaultsTo: 'success',
    },
  },
};
