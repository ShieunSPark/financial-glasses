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

// GET Google auth
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: process.env.CLIENT_DOMAIN + "/dashboard",
    failureMessage: true,
  })
);

// GET logout
router.post("/logout", auth_controller.logout_get);

// GET dashboard
router.get("/dashboard", checkLoggedIn, dashboard_controller.dashboard_get);

// POST Plaid link token
router.post("/api/create_link_token", plaid_controller.create_link_token);

// POST Plaid access token
router.post("/api/set_access_token", plaid_controller.set_access_token);

// GET accounts
router.get(
  "/dashboard/accounts",
  checkLoggedIn,
  dashboard_controller.accounts_get
);

// DELETE accounts
router.delete(
  "/dashboard/account",
  checkLoggedIn,
  dashboard_controller.account_delete
);

// GET synced transactions via /transactions/sync Plaid API route
router.get(
  "/dashboard/transactions/sync",
  checkLoggedIn,
  plaid_controller.transactions_sync
);

// GET transactions
router.get(
  "/dashboard/transactions",
  checkLoggedIn,
  dashboard_controller.transactions_get
);

// UPDATE a transaction
router.put(
  "/transaction/:transaction_id/put",
  checkLoggedIn,
  dashboard_controller.transaction_put
);

router.get(
  "/dashboard/chart",
  checkLoggedIn,
  dashboard_controller.dashboard_chart
);

// GET profile
router.get("/profile", checkLoggedIn, dashboard_controller.profile_get);

// GET categories in user's budget)
router.get(
  "/categories/:user_id",
  checkLoggedIn,
  dashboard_controller.categories_get
);

// UPDATE tracked categories in user's budget
router.put("/budget/update", checkLoggedIn, dashboard_controller.budget_put);

// DELETE tracked categories in user's budget
router.delete(
  "/budget/delete",
  checkLoggedIn,
  dashboard_controller.budget_delete
);

module.exports = router;
