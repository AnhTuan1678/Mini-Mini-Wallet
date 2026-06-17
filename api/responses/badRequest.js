module.exports = function (data) {
  return this.res.json({
    err: 400,
    message: 'Bad Request',
    ...data,
  });
};
