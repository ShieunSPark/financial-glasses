const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Budget = require("../models/budget");

exports.signup_post = [
  // Sanitize and validate all fields
  body("username")
    .trim()
    .isEmail()
    .withMessage("Username should be an email")
    .custom(async (value) => {
      const user = await User.find({ username: value });
      // Check if the user exists
      // For some reason, this logic is different from what I did in Members Only project... ¯\_(ツ)_/¯
      if (user.length > 0) {
        throw new Error("Email already in use");
      }
    })
    .withMessage(
      "This email is already in use. Click the 'Log in here' link below."
    )
    .escape(),
  body("firstName", "First name must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("lastName", "Last name must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("password", "Password must be at least 5 characters long")
    .trim()
    .isLength({ min: 5 })
    .escape(),
  body(
    "confirmPassword",
    "The second password does not match the first password"
  )
    .trim()
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .escape(),
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create User object with escaped and trimmed data
    // But first, salt the password!
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      try {
        const user = new User({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          username: req.body.username,
          password: hashedPassword,
          status: "user",
        });

        if (!errors.isEmpty()) {
          // There are errors. Render form again with sanitized values/error messages.

          // Re-render the sign-up page
          res.status(401).json({
            message: "Sign up!",
            user: user,
            errors: errors.array(),
          });
        } else {
          // Data from form is valid. Save user, and generate a new budget.
          await user.save();
          const budgets = await Budget.find({ user: user });
          if (budgets.length === 0) {
            const budget = new Budget({
              user: user,
            });
            await budget.save();
          }

          res.status(200).json({
            message: "Sign up successful!",
          });

          // res.redirect("/");
        }
      } catch (err) {
        return next(err);
      }
    });
  }),
];

exports.login_post = asyncHandler(async (req, res, next) => {
  const person = await User.findOne({ username: req.body.username });

  // const token = jwt.sign(
  //   { id: person._id, username: person.email },
  //   process.env.JWT_SECRET_KEY,
  //   {
  //     expiresIn: "1h",
  //   }
  // );

  // res.cookie("token", token, {
  //   withCredentials: true,
  //   httpOnly: false,
  // });

  res.json({
    // token: token,
    user: person,
  });
});

exports.logout_post = asyncHandler(async (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
  });
  res.json({
    message: "Logout successful",
  });
});
