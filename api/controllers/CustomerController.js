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

  getPocket: async function (req, res) {
    return res.ok({
      pocket: req.pocket,
    });
  },
};
