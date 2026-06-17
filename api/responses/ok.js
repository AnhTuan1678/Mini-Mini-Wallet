module.exports = function (data) {
  return this.res.json({
    err: 200,
    message: 'success',
    ...data,
  });
};
