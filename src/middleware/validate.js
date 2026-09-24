const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join(".") || source,
          message: issue.message,
        })),
      });
    }

    // Express 5: req.query is a read-only getter — store validated data separately
    if (source === "query") {
      req.validatedQuery = result.data;
    } else if (source === "params") {
      req.validatedParams = result.data;
    } else {
      req[source] = result.data;
    }

    next();
  };
};

module.exports = { validate };
