module.exports = function (data) {
  return this.res.json({
    err: respCode.BAD_REQUEST.code,
    message: respCode.BAD_REQUEST.message,
    ...data,
  });
};
