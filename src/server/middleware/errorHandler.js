const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', err);
  
  if (err.message && err.message.startsWith('Redirect to:')) {
    const redirectUrl = err.message.replace('Redirect to: ', '');
    return res.redirect(301, redirectUrl);
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

export default errorHandler;