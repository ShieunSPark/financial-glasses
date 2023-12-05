const express = require("express");
const router = express.Router();
const passport = require("passport");

const home_controller = require("../controllers/home");
const auth_controller = require("../controllers/auth");

const checkLoggedIn = require("../middleware/isLoggedIn");
// const checkAdmin = require("./middleware/isAdmin");

// GET home page
router.get("/", home_controller.home_get);

// GET signup
router.get("/signup", auth_controller.signup_get);

// POST signup
router.post("/signup", auth_controller.signup_post);

// GET login
router.get("/login", auth_controller.login_get);

// POST login
router.post("/login", auth_controller.login_post);

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

// GET dashboard
router.get("/dashboard", checkLoggedIn, auth_controller.dashboard_get);

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
