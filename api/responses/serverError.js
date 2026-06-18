module.exports = function (data) {
  return this.res.json({
    err: respCode.INTERNAL_SERVER_ERROR.code,
    message: respCode.INTERNAL_SERVER_ERROR.message,
    ...data,
  });
};
