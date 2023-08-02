const logErrors = (err, req, res, next) => {
  // eslint-disable-next-line
  console.error(err.stack);
  next(err);
};

module.exports = logErrors;
