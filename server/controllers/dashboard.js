const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

const User = require("../models/user");

exports.dashboard_get = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.session.passport.user);
  res.json({
    title: "Dashboard",
    user: user,
  });
});

exports.transactions_get = asyncHandler(async (req, res, next) => {
  res.json({
    title: "Transactions",
  });
});
