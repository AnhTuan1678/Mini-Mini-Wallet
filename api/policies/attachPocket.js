module.exports = async function (req, res, next) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.error({
        err: respCode.UNAUTHORIZED.code,
        message: respCode.UNAUTHORIZED.message,
      });
    }

    const pocket = await Pocket.findOne({ customer: userId });
    if (!pocket) {
      return res.notFound({
        message: 'Không tìm thấy ví cho khách hàng',
      });
    }

    req.pocket = pocket;
    return next();
  } catch (err) {
    return res.serverError(err.message);
  }
};
