// Consistent error shape: { success:false, error:{ code, message, details } }
export function errorHandler(err, req, res, next) {
  const status = Number.isInteger(err.statusCode) ? err.statusCode : err.status || 500;
  if (status >= 500) console.error(err);

  res.status(status).json({
    success: false,
    error: {
      code: err.code || (status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR'),
      message: status >= 500 ? 'Something went wrong.' : err.message,
      details: err.details || [],
    },
  });
}