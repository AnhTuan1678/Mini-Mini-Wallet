module.exports = {
  attributes: {
    type: {
      type: 'string',
      isIn: ['transfer', 'deposit', 'withdraw'],
      required: true,
    },
    fromPocket: { model: 'pocket' },
    fromPhone: { type: 'string' },
    fromBalanceAfter: { type: 'number' },
    fromBalanceBefore: { type: 'number' },
    toPocket: { model: 'pocket' },
    toPhone: { type: 'string' },
    toBalanceAfter: { type: 'number' },
    toBalanceBefore: { type: 'number' },
    amount: { type: 'number', required: true, min: 1 },
    status: {
      type: 'string',
      isIn: ['pending', 'success', 'failed'],
      defaultsTo: 'success',
    },
  },

  beforeCreate: function (values, proceed) {
    switch (values.type) {
      case 'deposit':
        if (!values.toPocket) {
          throw new Error('Phải có ví nhận (toPocket)');
        }
        break;

      case 'withdraw':
        if (!values.fromPocket) {
          throw new Error('Phải có ví gửi (fromPocket)');
        }
        break;

      case 'transfer':
        if (!values.fromPocket || !values.toPocket) {
          throw new Error(
            'Phải có cả ví gửi (fromPocket) và ví nhận (toPocket)',
          );
        }
        break;
    }

    return proceed();
  },
};
