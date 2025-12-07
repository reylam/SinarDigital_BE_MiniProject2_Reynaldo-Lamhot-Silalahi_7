const errorHandler = (err, req, res, next) => {
  console.error("Error:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  if (err.code?.startsWith("P")) {
    const prismaErrors = {
      P2002: { status: 409, message: "Unique constraint violation" },
      P2003: { status: 400, message: "Foreign key constraint failed" },
      P2025: { status: 404, message: "Record not found" },
      P2023: { status: 400, message: "Invalid data type" },
    };

    const errorInfo = prismaErrors[err.code] || {
      status: 500,
      message: "Database error",
    };
    return res.status(errorInfo.status).json({
      error: "Database Error",
      message: errorInfo.message,
      code: err.code,
    });
  }

  if (err.name === "ZodError") {
    return res.status(400).json({
      error: "Validation Error",
      details: err.errors,
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Invalid Token",
      message: "The provided token is invalid",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Token Expired",
      message: "The token has expired",
    });
  }

  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
};

export default errorHandler;
