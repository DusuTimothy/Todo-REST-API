const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    status: "error",
    message:
      statusCode === 500 ? "Internal Server Error" : err.message,
  });
};

module.exports = { errorHandler };
