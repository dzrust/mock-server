exports.sendError = (req, res, error, errorObject) => {
  console.error(error);
  res.status(500).json(errorObject);
};
