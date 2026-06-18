module.exports = function (data) {
  return this.res.json({
    err: respCode.NOT_FOUND.code,
    message: respCode.NOT_FOUND.message,
    ...data,
  });
};
