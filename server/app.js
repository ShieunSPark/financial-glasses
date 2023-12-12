const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");

// Configure dotenv and dotenv-expand
const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");
const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

const router = require("./routes/router");
const database = require("./api/mongodb");

const app = express();

// Access MongoDB database via the api folder
database();

app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

require("./passportConfig");
app.use((req, res, next) => {
  console.log("Session: " + req.session);
  next();
});

// Start passport session
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

// Custom passport middleware to access the current user
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// Routes
app.use("/", router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err,
  });
});

app.listen(3000, function () {
  console.log("Server is running on http://localhost:3000");
});

module.exports = app;
