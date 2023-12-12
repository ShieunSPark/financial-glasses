const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
// const Post = require("../models/post");
// const Comment = require("../models/comment");

exports.signup_get = asyncHandler(async (req, res, next) => {
  res.json({
    message: "Sign Up",
  });
});

// For POST signup:
// Sanitize and validate data, then create user in db
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
          // Data from form is valid. Save user.
          await user.save();
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

exports.login_get = asyncHandler(async (req, res, next) => {
  res.json({
    message: "Log in!",
  });
});

exports.login_post = asyncHandler(async (req, res, next) => {
  // passport.authenticate(
  //   "local",
  //   {
  //     successRedirect: "/dashboard",
  //     failureRedirect: "/login",
  //     failureMessage: true,
  //   },
  // Using an arrow function caused the code below to break...
  // This totally didn't take me 6+ hours to figure out...
  // async function (err, user, info) {
  //   if (err) return next(err);
  //   if (!user)
  //     return res.status(401).json({
  //       // info.message comes from the logic I used in app.js when setting up LocalStrategy
  //       error: "Authentication failed",
  //       message: info.message,
  //       user,
  //     });

  const person = await User.findOne({ username: req.body.username });
  if (person) {
    const token = jwt.sign(
      { id: person._id, username: person.email },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });

    res.json({
      token: token,
      user: person,
    });
  }
  // }
  // )(req, res, next);
});

exports.dashboard_get = asyncHandler(async (req, res, next) => {
  res.json({
    title: "Dashboard",
  });
});

// exports.post_get = asyncHandler(async (req, res, next) => {
//   const post = await Post.findById(req.params.id).populate("user").exec();
//   const comments = await Comment.find({ post: post }).populate("user").exec();

//   if (!post) {
//     res.status(404).send("Post not found");
//   }

//   res.json({
//     title: post.name,
//     post: post,
//     comments: comments,
//   });
// });

// exports.post_post = [
//   // Sanitize and validate all fields
//   body("title")
//     .trim()
//     .isLength({ min: 1 })
//     .withMessage("Title must not be empty"),
//   body("description")
//     .trim()
//     .isLength({ min: 1 })
//     .withMessage("Description must not be empty"),
//   body("text")
//     .trim()
//     .isLength({ min: 1 })
//     .withMessage("Post must not be empty"),

//   asyncHandler(async (req, res, next) => {
//     // Extract the validation errors from a request.
//     const errors = validationResult(req);

//     // Check if a post with the provided title already exists
//     const duplicate = await Post.find({ title: req.body.title }).exec();

//     // Update isPublished if the admin checked the option to publish the post
//     const post = new Post({
//       user: res.locals.currentUser,
//       title: req.body.title,
//       description: req.body.description,
//       text: req.body.text,
//       isPublished: true,
//     });

//     if (!errors.isEmpty()) {
//       // There are errors. Render form again with sanitized values/error messages.

//       // Re-render the post page
//       res.json({
//         message: "Post",
//         post: post,
//         errors: errors.array(),
//       });
//     } else if (duplicate.length === 1) {
//       res.json({
//         message: "Post",
//         post: post,
//         errors: "A post with the same title already exists",
//       });
//     } else if (res.locals.currentUser.status !== "admin") {
//       res.json({
//         message: "Post",
//         post: post,
//         errors:
//           "You do not have the correct level of authorization to create posts :-(",
//       });
//     } else {
//       // Data from form is valid. Save Post.
//       await post.save();
//       res.json({
//         message: "Post successfully posted!",
//       });
//       res.redirect(post.url);
//     }
//   }),
// ];

// exports.post_update = asyncHandler(async (req, res, next) => {
//   const post = await Post.findById({ _id: req.params.post_id });

//   // Update the post's components
//   post.title = req.body.title;
//   post.description = req.body.description;
//   post.text = req.body.text;
//   post.date = new Date();

//   await post.save();

//   res.json({
//     message: "Successfully update the post!",
//     post: post,
//   });
// });

// exports.post_delete = asyncHandler(async (req, res, next) => {
//   const post = await Post.findById({ _id: req.params.post_id });

//   await post
//     .deleteOne()
//     .then(function () {
//       console.log("Post deleted"); // Success
//     })
//     .catch(function (error) {
//       console.log(error); // Failure
//     });

//   res.status(204).json({
//     message: "Successfully deleted the post!",
//     post: post,
//   });
// });

// exports.comment_post = [
//   body("text")
//     .trim()
//     .isLength({ min: 1 })
//     .withMessage("Comment must not be empty")
//     .escape(),

//   asyncHandler(async (req, res, next) => {
//     // Extract the validation errors from a request.
//     const errors = validationResult(req);

//     // Create the comment
//     const comment = new Comment({
//       user: res.locals.currentUser,
//       post: req.body.post,
//       text: req.body.text,
//     });

//     if (!errors.isEmpty()) {
//       res.json({
//         message: "Comment",
//         comment: comment,
//         error: errors,
//       });
//     } else {
//       // Data from form is valid. Save Comment.
//       await comment.save();
//       res.json({
//         message: "Comment successfully made!",
//       });
//       res.redirect(comment.url);
//     }
//   }),
// ];

// exports.about_get = asyncHandler(async (req, res, next) => {
//   res.json({
//     message: "The about page",
//   });
// });
