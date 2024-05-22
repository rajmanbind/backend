// const asyncHandler = (requestHandler) => {
//   (req, res, next) => {
//     Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
//   };
// };

const asyncHandler = (fn) => async (err, req, res, next) => {
  {
    try {
      await fn(req, res, next);
    } catch (error) {
      console.log("ERROR: ", error);
      res.status(error.code || 500).json({
        success: false,
        message: error.message,
      });
    }
  }
};
export { asyncHandler };
