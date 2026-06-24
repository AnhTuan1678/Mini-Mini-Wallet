const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = {
  create: async function (req, res) {
    const { phone, password } = req.body;
    // Kiểm tra xem số điện thoại và mật khẩu có hợp lệ không
    if (!phone || !password) {
      return res.badRequest({
        message: 'Số điện thoại và mật khẩu là bắt buộc',
      });
    }
    if (!/^0\d{9}$/.test(phone)) {
      return res.badRequest({
        message: 'Số điện thoại không hợp lệ',
      });
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password)) {
      return res.badRequest({
        message: 'Mật khẩu không hợp lệ',
      });
    }
    try {
      // Kiểm tra xem số điện thoại đã tồn tại chưa
      const existingCustomer = await Customer.findOne({ phone });
      if (existingCustomer) {
        return res.badRequest({
          message: 'Số điện thoại đã tồn tại',
        });
      }

      // Tạo khách hàng mới và ví tương ứng (hash mật khẩu trước khi lưu)
      const hashedPassword = await bcrypt.hash(password, 10);
      const customer = await Customer.create({
        phone,
        password: hashedPassword,
      }).fetch();
      await Pocket.create({ customer: customer.id });
      return res.ok({
        customer: {
          id: customer.id,
          phone: customer.phone,
        },
        message: 'Khách hàng và ví đã được tạo thành công',
      });
    } catch (err) {
      return res.serverError({
        message: `Lỗi khi tạo khách hàng và ví: ${err.message}`,
      });
    }
  },

  login: async function (req, res) {
    const { phone, password } = req.body;
    const JWT_SECRET = process.env.JWT_SECRET || 'secret';
    const customer = await Customer.findOne({ phone });
    if (!customer) {
      return res.notFound({
        message: 'Số điện thoại không tồn tại',
      });
    }

    const passwordMatches = await bcrypt.compare(password, customer.password);
    if (!passwordMatches) {
      return res.notFound({
        message: 'Mật khẩu không đúng',
      });
    }
    const token = jwt.sign(
      {
        id: customer.id,
        phone: customer.phone,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
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
