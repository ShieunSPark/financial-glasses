const express = require("express");
const router = express.Router();
const passport = require("passport");

const auth_controller = require("../controllers/auth");
const dashboard_controller = require("../controllers/dashboard");
const plaid_controller = require("../controllers/plaid");

const checkLoggedIn = require("../middleware/isLoggedIn");
// const checkAdmin = require("./middleware/isAdmin");

// POST signup
router.post("/signup", auth_controller.signup_post);

// POST login
router.post(
  "/login",
  function (req, res, next) {
    passport.authenticate(
      "local",
      { failureMessage: true },
      function (err, user, info) {
        if (err) return next(err);
        if (!user)
          return res.status(401).json({
            error: "Authentication failed",
            message: info.message,
            user,
          });

        // This code below is VERY important
        req.login(user, next);
      }
    )(req, res, next);
  },
  auth_controller.login_post
);

// // GET Google auth
// // Placing these in authController caused issues - maybe with asyncHandler?
// router.get(
//   "/login/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// router.get(
//   "/oauth2/redirect/google",
//   passport.authenticate("google", {
//     failureRedirect: "/login",
//     failureMessage: true,
//   }),
//   function (req, res) {
//     // Successful authentication, redirect home.
//     res.redirect("http://localhost:5173/");
//   }
// );

// GET logout
router.post("/logout", auth_controller.logout_get);

// GET dashboard
router.get("/dashboard", checkLoggedIn, dashboard_controller.dashboard_get);

// POST Plaid link token
router.post("/api/create_link_token", plaid_controller.create_link_token);

// POST Plaid access token
router.post("/api/set_access_token", plaid_controller.set_access_token);

// // GET a singular post (and its attached comments)
// router.get("/post/:post_id", home_controller.post_get);

// // POST (i.e., make) a singular post
// router.post("/post/:post_id", checkAdmin, home_controller.post_post);

// // UPDATE a singular post
// router.put("/post/:post_id", home_controller.post_update);

// // DELETE a singular post
// router.delete("/post/:post_id", home_controller.post_delete);

// // POST a comment on a post
// router.post(
//   "/post/:post_id/comment/:comment_id",
//   checkLoggedIn,
//   home_controller.comment_post
// );

// // GET about
// router.get("/about", home_controller.about_get);

module.exports = router;
