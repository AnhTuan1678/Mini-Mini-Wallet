module.exports = function (data) {
  return this.res.json({
    err: 500,
    message: 'Error',
    ...data,
  });
};
