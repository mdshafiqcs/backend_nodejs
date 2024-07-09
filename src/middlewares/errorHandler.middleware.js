// default error handler
const errorHandler = (err, req, res, next) => {

  const errMsg = err.message || 'Something went wrong';
  const statusCode = err.statusCode || 500;

  if(res.headersSent){
      return next(errMsg);
  }

  res.status(statusCode).json({
      success: err.success || false,
      message: errMsg,
      statusCode,
      data: err.data || null,
      errors: process.env.NODE_ENV === 'development' ? err.errors : [],
      stack: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
}

export default errorHandler;
