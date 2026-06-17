const jwt = require('jsonwebtoken');

module.exports = {
  create: async function (req, res) {
    const { phone, password } = req.body;
    try {
      const customer = await Customer.create({ phone, password }).fetch();
      await Pocket.create({ customer: customer.id });
      return res.ok({
        customer,
      });
    } catch (err) {
      return res.error({
        message: `Failed to create customer: ${err.message}`,
      });
    }
  },

  login: async function (req, res) {
    const { phone, password } = req.body;
    const JWT_SECRET = process.env.JWT_SECRET || 'secret';
    const customer = await Customer.findOne({ phone, password });
    if (!customer) {
      return res.badRequest({
        message: 'Invalid phone or password',
      });
    }
    const token = jwt.sign(
      {
        id: customer.id,
        phone: customer.phone,
      },
      JWT_SECRET,
      { expiresIn: '1h' },
    );
    return res.ok({
      token,
    });
  },

  getBalance: async function (req, res) {
    const customerId = req.user.id;
    try {
      const pocket = await Pocket.findOne({ customer: customerId });
      if (!pocket) {
        return res.badRequest({
          message: 'Pocket not found for this customer',
        });
      }
      return res.ok({
        balance: pocket.balance,
      });
    } catch (err) {
      return res.error({
        message: `Failed to retrieve balance: ${err.message}`,
      });
    }
  },
};
