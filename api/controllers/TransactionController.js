module.exports = {
  getTransactions: async function (req, res) {
    try {
      const transactions = await Transaction.find({
        or: [{ fromPocket: req.pocket.id }, { toPocket: req.pocket.id }],
      }).sort('createdAt DESC');
      return res.ok({ transactions });
    } catch (err) {
      sails.log.error(err);
      return res.serverError({
        message: 'Lỗi khi lấy danh sách giao dịch',
      });
    }
  },
};
