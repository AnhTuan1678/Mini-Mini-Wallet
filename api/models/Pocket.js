module.exports = {
  attributes: {
    balance: {
      type: 'number',
      defaultsTo: 1000000,
    },
    customer: {
      model: 'customer',
      unique: true,
      required: true,
    },
  },
};
