const asyncHandler = require("express-async-handler");

exports.home_get = asyncHandler(async (req, res, next) => {
  res.json({
    message: "Financial Glasses",
  });
});
