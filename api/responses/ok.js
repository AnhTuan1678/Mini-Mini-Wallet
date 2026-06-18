module.exports = function (data) {
  return this.res.json({
    err: respCode.SUCCESS.code,
    message: respCode.SUCCESS.message,
    ...data,
  });
};
