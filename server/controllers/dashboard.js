const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

const User = require("../models/user");
const Item = require("../models/item");

exports.dashboard_get = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.session.passport.user);
  const items = await Item.find({ user: user });
  const numOfItems = items.length;

  res.json({
    title: "Dashboard",
    user: user,
    numOfItems: numOfItems,
    items: items,
  });
});
