const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

const User = require("../models/user");
const Item = require("../models/item");

exports.dashboard_get = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.session.passport.user);
  const item = await Item.findOne({ user: user });
  if (!item) {
    res.json({
      title: "Dashboard",
      user: user,
    });
  } else {
    res.json({
      title: "Dashboard",
      user: user,
      itemName: item.name,
    });
  }
});
