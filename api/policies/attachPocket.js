module.exports = async function (req, res, next) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.badRequest({
        message: 'User ID not found in token',
      });
    }

    const pocket = await Pocket.findOne({ customer: userId });
    if (!pocket) {
      return res.badRequest({
        message: 'Pocket not found for this customer',
      });
    }

    req.pocket = pocket;
    return next();
  } catch (err) {
    return res.serverError(err.message);
  }
};
