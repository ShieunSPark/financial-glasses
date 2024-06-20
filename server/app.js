const express = require("express");
const session = require("express-session");
const logger = require("morgan");
const cors = require("cors");
const createError = require("http-errors");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const passport = require("passport");

// Configure dotenv and dotenv-expand
const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");
const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

const router = require("./routes/router");

const app = express();

// Set up mongoose
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

app.use(
  cors({
    origin: [process.env.CLIENT_DOMAIN],
    credentials: true,
  })
);
app.use(logger("dev"));
app.use(express.json());

app.use(express.urlencoded({ extended: false }));

// Start passport session
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // Save session in Mongo rather than local memory
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 30 * 60, // 30 minutes * 60 seconds/min
      touchAfter: 9 * 60, // only update session after __ seconds
    }),
    // cookie: {
    //   maxAge: 1000 * 60 * 10, // 1000 ms/sec * 60 sec/min * 10 min
    //   secure: false,
    // },
  })
);

// Configure Passportjs strategies (and serialization)
require("./passportConfig");

app.use(passport.initialize());
app.use(passport.session());

// Custom middleware to show current express-session details
// app.use((req, res, next) => {
//   console.log(req.session);
//   next();
// });

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
